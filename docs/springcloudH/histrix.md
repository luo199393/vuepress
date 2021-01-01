## histrix使用

地址：https://github.com/Netflix/Hystrix/wiki/How-To-UseHystrix

hystrix工作流程
<a data-fancybox title="hystrix工作流程" href="/springcloudh/hystrix/hystrix工作流程.bmp">![hystrix工作流程](/springcloudh/hystrix/hystrix工作流程.bmp "hystrix工作流程")</a>

hystrix步骤说明
<a data-fancybox title="hystrix步骤说明" href="/springcloudh/hystrix/hystrix步骤说明.bmp">![hystrix步骤说明](/springcloudh/hystrix/hystrix步骤说明.bmp "hystrix步骤说明")</a>


1、服务降级

1.1、服务器忙，请稍候再试，不让客户端等待并立刻返回一个友好提示，fallback

1.2、哪些情况会触发降级

   1.2.1、程序运行异常
   
   1.2.2、超时
   
   1.2.3、服务熔断触发服务降级
   
   1.2.4、线程池/信号量打满也会导致服务降级
   
2、服务熔断

  类比保险丝达到最大服务访问后，直接拒绝访问，拉闸限电，然后调用服务降级的方法并返回友好提示
  就是保险丝
  服务的降级->进而熔断->恢复调用链路
  
3、服务限流

  秒杀高并发等操作，严禁一窝蜂的过来拥挤，大家排队，一秒钟N个，有序进行


## 提供者配置服务降级示例

```演示示例为线程休眠和运行异常```

1、增加Hystrix坐标
```pom
 <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```
2、启动类增加 ```@EnableCircuitBreaker``` //开启hystrix配置

3、提供者业务类演示服务降级，调用此方法超过3秒钟或者程序运行异常，回调paymentInfo_TimeOutHandler服务降级。

```java
    @HystrixCommand(fallbackMethod = "paymentInfo_TimeOutHandler",commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds",value = "3000")
    })
    public String paymentInfo_TimeOut(Integer id){
        //运行异常，异常后由Hystrix回调paymentInfo_TimeOutHandler方法
        //int age = 10/0;

        //运行超时，设置线程休眠5秒，feign超时后由Hystrix回调paymentInfo_TimeOutHandler方法
        int timeNumber = 5000;
        try { TimeUnit.MILLISECONDS.sleep(timeNumber); }catch (Exception e) {e.printStackTrace();}
        return "线程池："+Thread.currentThread().getName()+"\t"+"paymentInfo_TimeOut方法";
    }
```

4、@HystrixCommand全部配置

<a data-fancybox title="断路器1" href="/springcloudh/hystrix/断路器1.bmp">![断路器1](/springcloudh/hystrix/断路器1.bmp "断路器1")</a>
<a data-fancybox title="断路器2" href="/springcloudh/hystrix/断路器2.bmp">![断路器1](/springcloudh/hystrix/断路器2.bmp "断路器2")</a>
<a data-fancybox title="断路器3" href="/springcloudh/hystrix/断路器3.bmp">![断路器1](/springcloudh/hystrix/断路器3.bmp "断路器3")</a>


----

### 消费者客户端配置服务降级示例
1、增加pom坐标
```pom
 <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
</dependency>
```

2、yml配置文件增加设置ribbon超时问题，默认1000毫秒。这里为了演示设置20000毫秒

```
#设置feign客户端超市时间,整个请求时间超过1秒（默认疫苗）会请求超市，允许设置等待时间长一点
ribbon:
  #指的是建立连接后从服务器读取到可用资源所用的时间
  ReadTimeout: 20000
  #建立连接所用的时间
  ConnectTimeout: 20000
```

3、启动类增加注解 ```@EnableHystrix```

4、直接在controller层演示示例，service层直接用的openfeign使用接口远程调用，故不方便在service层写

提供者的服务设置5000毫秒休眠，超过7000毫秒则回调paymentInfo_TimeOutHandler方法

```
    @HystrixCommand(fallbackMethod = "paymentInfo_TimeOutHandler",commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds",value = "7000")
    })
    public String paymentInfo_TimeOut(Integer id){
        //运行异常，异常后由Hystrix回调paymentInfo_TimeOutHandler方法
        //int age = 10/0;

        //运行超时，设置线程休眠3秒，feign超时后由Hystrix回调paymentInfo_TimeOutHandler方法
        int timeNumber = 5000;
        try { TimeUnit.MILLISECONDS.sleep(timeNumber); }catch (Exception e) {e.printStackTrace();}
        return "线程池："+Thread.currentThread().getName()+"\t"+"paymentInfo_TimeOut方法";
    }

    //Hyistrix，超时后调用此方法
    public String paymentInfo_TimeOutHandler(Integer id){

        return "线程池："+Thread.currentThread().getName()+"8001Hystrix回调paymentInfo_TimeOutHandler方法";
    }
```

5、消费者客户端代码，修改value，7000毫秒为正常返回时间，此时7秒大于提供者设置的休眠5秒，可以正确执行接口则ok

```
    @GetMapping("/hystrix/timeout/{id}")
    @HystrixCommand(fallbackMethod = "paymentTimeOutFallbackMethod",commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds",value = "7000")  //7秒钟以内就是正常的业务逻辑
    })
    public String paymentInfo_TimeOut(@PathVariable("id") Integer id){
        //int age = 10/0;
        String result = paymentHystrixService.paymentInfo_TimeOut(id);
        log.info("*******result:"+result);
        return result;
    }

    //Hyistrix，超时后调用此方法
    public String paymentTimeOutFallbackMethod(@PathVariable("id") Integer id){
        return "我是消费者80，对付支付系统繁忙请10秒钟后再试或者自己运行出错请检查自己,(┬＿┬)";
    }
```

5.1、把消费客户端的注解@HystrixProperty的value值改成2000比提供者的小，并且也要比提供者设置的休眠时间也要小，此时回调消费者

5.2、把消费客户端的注释打开 int age = 10/0 ，演示消费客户端出现异常也要回滚成功，并且回调方法


### Hystrix默认回调

@DefaultProperties(defaultFallback = "paymentTimeOutFallbackMethod")配置回调方法，如果方法接口定义了 @HystrixCommand注解就走自定义，否则没有自定义就使用默认

1、controller类增加 注解
```
//默认设定全局方法和设置多少时间内正常
@DefaultProperties(defaultFallback = "payment_global_fallback_method",
        commandProperties = {
        @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds",value = "6000")  //6秒钟以内就是正常的业务逻辑
})
```

2、示例代码，使用全局配置

```
    @GetMapping("/hystrix/timeout/{id}")
    @HystrixCommand
    public String paymentInfo_TimeOut(@PathVariable("id") Integer id){
        //int age = 10/0;
        String result = paymentHystrixService.paymentInfo_TimeOut(id);
        log.info("*******result:"+result);
        return result;
    }
     //Hyistrix，自定义超时后调用此方法
    public String paymentTimeOutFallbackMethod(@PathVariable("id") Integer id){ 
        return "我是消费者80，对付支付系统繁忙请10秒钟后再试或者自己运行出错请检查自己,(┬＿┬)";
    }
```

3、或者也可以把类注解去掉@HystrixProperty，在每个方法加上设置多少时间内正常

```
    @GetMapping("/hystrix/timeout/{id}")
    @HystrixCommand(fallbackMethod = "paymentTimeOutFallbackMethod",commandProperties = {
            @HystrixProperty(name = "execution.isolation.thread.timeoutInMilliseconds",value = "6000")  //6秒钟以内就是正常的业务逻辑
    })
    public String paymentInfo_TimeOut(@PathVariable("id") Integer id){
        //int age = 10/0;
        String result = paymentHystrixService.paymentInfo_TimeOut(id);
        log.info("*******result:"+result);
        return result;
    }
```

### 全局回调FallbackFactory

统一处理远程调用服务。注：这里只能是服务消费者远程调用提供者出现异常、超时、宕机等有效，在消费者端controller层调用对应service层才有效果。controller不是调用service远程方法出现的异常、超时、宕机不会服务降级

1、yml，这里要配置ribbon时间长点演示

```
server:
  port: 80


eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka

spring:
  application:
    name: cloud-consumer-hystrix-payment

#设置feign客户端超市时间,整个请求时间超过1秒（默认疫苗）会请求超市，允许设置等待时间长一点
ribbon:
  OkToRetryOnAllOperations: false #对所有操作请求都进行重试,默认false
  ReadTimeout: 20000   #负载均衡超时时间，默认值5000
  ConnectTimeout: 10000 #ribbon请求连接的超时时间，默认值2000
  MaxAutoRetries: 0     #对当前实例的重试次数，默认0
  MaxAutoRetriesNextServer: 1 #对切换实例的重试次数，默认1

 #在service层使用fallbackFactory统一回调，需要加这个配置开启
feign:
  hystrix:
    enabled: true

#需要增加fallbackFactory超时问题
hystrix:
  command:
    default:  #default全局有效，service id指定应用有效
      execution:
        timeout:
          #如果enabled设置为false，则请求超时交给ribbon控制,为true,则超时作为熔断根据
          #在service层使用fallbackFactory统一回调，需要加这个配置
          enabled: true
        isolation:
          thread:
#断路器超时时间，默认1000ms，如果使用全局fallbackFactory配置，则估计ribbon远程调用所使用时间，当发送请求1秒后收不到回复则熔断。
#如果此超时时间设置比ribbon大，远程调用方法后ribbon超时也会执行服务降级和熔断
            timeoutInMilliseconds: 1000 
```

2、远程调用方法

```
@FeignClient(name = "CLOUD-PROVIDER-HYSTRIX-PAYMENT",fallbackFactory = UserFeignClientHystrixFallbackFactory.class)
public interface UserFeignClient {

    @GetMapping(value = "/payment/hystrix/ok/{id}")
    String ok(@PathVariable("id") Integer id);

    @GetMapping(value = "/payment/hystrix/timeout/{id}")
    String timeOut(@PathVariable("id") Integer id);
}
```
3、统一FallbackFactory处理超时、异常、宕机，匿名内部类
```
@Component
public class UserFeignClientHystrixFallbackFactory implements FallbackFactory<UserFeignClient>
{

    @Override
    public UserFeignClient create(Throwable throwable)
    {
        System.out.println("UserFeignClientHystrixFallbackFactory类");
        return new UserFeignClient()
        {
            @Override
            public String ok(Integer id) {
                return "FallbackFactory服务降级";
            }

            @Override
            public String timeOut(Integer id) {
                return "FallbackFactory服务降级";
            }
        };
    }
}
```

## 标准消费者客户端yml配置

根据实际接口请求时间，基本上接口需要保证1秒内返回结果，基本上在消费者客户端配置


```
server:
  port: 80
eureka:
  client:
    register-with-eureka: true
    fetch-registry: true
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
spring:
  application:
    name: cloud-consumer-hystrix-payment
#设置feign客户端超市时间,整个请求时间超过1秒（默认一秒）会请求超市，允许设置等待时间长一点
ribbon:
  OkToRetryOnAllOperations: false #对所有操作请求都进行重试,默认false
  ReadTimeout: 5000   #负载均衡超时时间，默认值5000
  ConnectTimeout: 2000#ribbon请求连接的超时时间，默认值2000
  MaxAutoRetries: 0     #对当前实例的重试次数，默认0
  MaxAutoRetriesNextServer: 1 #对切换实例的重试次数，默认1
feign:
  hystrix:
    enabled: true #在service层使用fallbackFactory统一回调，需要加这个配置
hystrix:
  command:
    default:  #default全局有效，service id指定应用有效
      execution:
        timeout:
          #如果enabled设置为false，则请求超时交给ribbon控制,为true,则超时作为熔断根据
          enabled: true
        isolation:
          thread:
            timeoutInMilliseconds: 2000 #断路器超时时间，默认1000ms
```

## 服务熔断

为了方便直接在提供者演示

1、服务提供者
```
//==========服务熔断
    @HystrixCommand(fallbackMethod = "paymentCircuitBreaker_fallback",commandProperties = {
            @HystrixProperty(name = "circuitBreaker.enabled",value = "true"),  //是否开启断路器
            @HystrixProperty(name = "circuitBreaker.requestVolumeThreshold",value = "10"),   //请求次数
            //10秒之后达到半开状态，然后测试请求成功就恢复该方法调用，否则继续下一次熔断，直到可以调用成功
            @HystrixProperty(name = "circuitBreaker.sleepWindowInMilliseconds",value = "10000"),
            @HystrixProperty(name = "circuitBreaker.errorThresholdPercentage",value = "60"), //失败率达到多少后跳闸
    })
    public String paymentCircuitBreaker(Integer id){
        if (id < 0){
            throw new RuntimeException("*****id 不能负数");
        }
        String serialNumber = IdUtil.simpleUUID();

        return Thread.currentThread().getName()+"\t"+"调用成功,流水号："+serialNumber;
    }
    public String paymentCircuitBreaker_fallback( Integer id){
        return "id 不能负数，请稍候再试,(┬＿┬)/~~     id: " +id;
    }
```

2、接口

```
    //===服务熔断
    @GetMapping("/payment/circuit/{id}")
    public String paymentCircuitBreaker(@PathVariable("id") Integer id){
        String result = paymentService.paymentCircuitBreaker(id);
        log.info("*******result:"+result);
        return result;
    }

```

3、连续调用上面接口，引出异常id<0使用接口调用6次，在调用id>1接口四次，则出现熔断，需要等待10000毫秒开启半开装状态


## HystrixDashboard图形化搭建

1、新建项目，启动类加```@EnableHystrixDashboard```开启监控图形化，增加9001访问端口

2、HystrixDashboard增加pom

```
<!--新增hystrix dashboard-->
<dependency>
<groupId>org.springframework.cloud</groupId>
<artifactId>spring-cloud-starter-netflix-hystrix-dashboard</artifactId>
</dependency>
```

3、提供者和消费者增加pom

```
<dependency>
<groupId>org.springframework.boot</groupId>
<artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

3.1、需要被监控的服务增加bean，H版修改了，下面路径是用来访问打开HystrixDashboard图形化

```
    //hystrixDashboard服务监控,修改地址
    @Bean
    public ServletRegistrationBean getServlet(){
        HystrixMetricsStreamServlet streamServlet = new HystrixMetricsStreamServlet();
        ServletRegistrationBean registrationBean = new ServletRegistrationBean(streamServlet);
        registrationBean.setLoadOnStartup(1);
        registrationBean.addUrlMappings("/hystrix.stream");
        registrationBean.setName("HystrixMetricsStreamServlet");
        return registrationBean;
    }
```

4、打开网址 http://localhost:9001/hystrix

4.1、输入需要监控服务的地址，例如提供者http://localhost:8001，填写Title。点击Monitor Stream打开访问

4.2、访问8001提供者服务调用接口即可查看


