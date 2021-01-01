### IRule更换轮询算法

官网地址: https://github.com/Netflix/ribbon/wiki/Getting-Started

1、添加bean，选择官方自带实现轮询如下注解
```
**
 * @author lzf
 * @create 2020-04-20 21:51
 * Ribbon核心组件IRule，替换轮询算法，添加玩后在主启动类增加
 * 可替换的轮询算法，也可自定义轮询算法
 * RoundRobinRule轮询、
 * RandomRule随机、
 * RetryRule  先按照RoundRobinRule的策略获取服务，如果获取服务失败则在指定时间内会进行重试
 * WeightedResponseTimeRule  对RoundRobinRule的扩展，响应速度越快的实例选择权重越大，越容易被选择
 * BestAvailableRule  会先过滤掉由于多次访问故障而处于断路器跳闸状态的服务，然后选择一个并发量最小的服务
 * AvailabilityFilteringRule  先过滤掉故障实例，再选择并发较小的实例
 * ZoneAvoidanceRule 默认规则，复合判断server所在区域的性能和server的可用性选择服务器
 *
 * 在下面bean对应实现就行
 */
@Configuration
public class MySelfRule {

    @Bean
    public IRule myRule(){
        return new RandomRule();//定义随机
    }
}
```
2、启动类添加
//name的服务名称必须大写，选择轮询bean,效果RandomRule随机访问提供者接口

```
@RibbonClient(name = "CLOUD-PAYMENT-SERVICE",configuration = MySelfRule.class)
```



### 自定义轮询算法

修改自带轮询算法需要删除项目中的@LoadBalanced，


1、新建LoadBalanced接口
```
public interface LoadBalanced {

    ServiceInstance instance(List<ServiceInstance> serviceInstances);

}
```

2、实现上面接口

```
@Component
public class MyLB implements LoadBalanced {

    private AtomicInteger atomicInteger = new AtomicInteger(0);

    public final int getAndIncrement(){
        int current;
        int next;
        do {
            current = this.atomicInteger.get();
            next = current >= 2147483647 ? 0 : current+1;
        }while (!this.atomicInteger.compareAndSet(current,next));
        System.out.println("第几次访问次数next"+next);
        return next;
    }


    @Override
    public ServiceInstance instance(List<ServiceInstance> serviceInstances) {
        int index = getAndIncrement() % serviceInstances.size();
        return serviceInstances.get(index);
    }
}
```

3、编写接口

	//自定义轮询
    @Autowired
    public LoadBalanced loadBalanced;

    //对于注册进eureka里面的微服务，可以通过服务发现来获得该服务的信息
    @Autowired
    private DiscoveryClient discoveryClient;
    // end自定义轮询
	
	//自定义轮询接口
    @GetMapping(value = "/payment/lb")
    public String getPaymentLB(){
		//获取eureka当前下面服务名称所有服务
        List<ServiceInstance> instances = discoveryClient.getInstances("CLOUD-PAYMENT-SERVICE");
        if(instances == null || instances.size()<=0){
            return null;
        }
        ServiceInstance serviceInstance = loadBalanced.instance(instances);
        URI uri = serviceInstance.getUri();
		///payment/lb 提提供者服务提供的接口
        return restTemplate.getForObject(uri+"/payment/lb",String.class);
    }

