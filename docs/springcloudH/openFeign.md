## openfeign搭建使用

1、添加坐标
```
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>
```

2、yml配置
```
server:
  port: 80

spring:
  application:
    name: cloud-openfeign-order-service

eureka:
  client:
    #注册到eureka
    register-with-eureka: true
    #获取eureka注册信息
    fetchRegistry: true
    service-url:
      #http://eureka7001.com:7001/eureka/,http://eureka7002.com:7002/eureka/,http://eureka7003.com:7003/eureka
      defaultZone: http://eureka7001.com:7001/eureka/
  instance:
    #主机名称
    instance-id: cloud-openfeign-order-service

#设置feign客户端超市时间,整个请求时间超过1秒（默认疫苗）会请求超市，允许设置等待时间长一点
ribbon:
  #指的是建立连接后从服务器读取到可用资源所用的时间
  ReadTimeout: 5000
  #建立连接所用的时间
  ConnectTimeout: 5000

#配置openFeign日志，日志以什么级别监控哪个接口
logging:
  level:
    com.atguigu.springcloud.service.PaymentFeignService: debug

```

3、启动类增加注解
```
@SpringBootApplication
@EnableFeignClients
```

## 消费者

1、消费者提供全部controller接口。也可以基于提供者业务层接口方法。这里使用controller层
```
/**
 * @author lzf
 * @create 2020-04-26 22:42
 * openfeign封装了feign，使其支持SpringMVC注解使用
 * 1、这里直接使用提供者的controller层对应方法
 * 2、可以使用提供者service接口类的方法
 */
@FeignClient(value = "CLOUD-PAYMENT-SERVICE")
public interface PaymentFeignService {

    @PostMapping(value = "/payment/create")
    CommonResult create(@RequestBody Payment payment);

    @GetMapping(value = "/payment/get/{id}")
    CommonResult getPayment( @PathVariable("id") Long id);
}
```

2、消费者 controller层接口示例
```
@RestController
@RequestMapping("/consumer")
public class OrderOpenFeignController {

    @Autowired
    private PaymentFeignService paymentFeignService;

    @GetMapping(value = "/payment/get/{id}")
    public CommonResult<Payment> getPaymentById(@PathVariable("id") Long id){
        return paymentFeignService.getPayment(id);
    }

    @PostMapping(value = "/payment/create")
    CommonResult create(@RequestBody Payment payment){
        return paymentFeignService.create(payment);
    }
}

#启动类
@SpringBootApplication
@EnableFeignClients
public class OrderOpenFeignMain80 {

    public static void main(String[] args) {
        SpringApplication.run(OrderOpenFeignMain80.class,args);
    }
}
```

## OpenFeign超时控制
一般来说常见是消费者调用提供者出现超时问题，配置在消费者控制超时问题，配置文件增加如下，默认1秒，超过一秒继任为超时
设置feign客户端超市时间,整个请求时间超过1秒（默认一秒）会请求超时，允许设置等待时间长一点
yml配置
```
ribbon:
  #指的是建立连接后从服务器读取到可用资源所用的时间
  ReadTimeout: 5000
  #建立连接所用的时间
  ConnectTimeout: 5000

#3、openFeign日志打印
	提供者增加配置
#配置openFeign日志，日志以什么级别监控哪个接口
logging:
  level:
    com.atguigu.springcloud.service.PaymentFeignService: debug
	
	配置bean
@Configuration
```

```
public class FeignConfig {

    /**
     * openFeign日志功能
     * 日志级别NONE：默认的，不显示任何日志
     * 、BASIC：仅记录请求方法、URl、响应状态码及执行时间
     * 、HEADERS：除了BASIC中定义的信息之外，还有请求和响应头的信息
     * 、FULL：除了HEADERS中定义的信息之外，还有请求和响应的正文及元数据
     * @return
     */
    @Bean
    Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }
}
```