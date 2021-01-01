## gateway

1、概述

概述1

<a data-fancybox title="概述1" href="/springcloudh/gateway/概述1.bmp">![概述1](/springcloudh/gateway/概述1.bmp "概述1")</a>
概述2

<a data-fancybox title="概述2" href="/springcloudh/gateway/概述2.bmp">![概述2](/springcloudh/gateway/概述2.bmp "概述2")</a>
概述3

<a data-fancybox title="概述3" href="/springcloudh/gateway/概述3.bmp">![概述3](/springcloudh/gateway/概述3.bmp "概述3")</a>


## gateway三大核心概念
1、Route(路由)

  路由是构建网关的基本模块，它由ID，目标URI，一系列的断言和过滤器组成，如果断言为true则匹配该路由
  
2、Predicate（断言）

  参考的是java8的java.util.function.Predicate开发人员可以匹配HTTP请求中的所有内容（例如请求头或请求参数），如果请求与断言相匹配则进行路由

3、Filter(过滤)

  指的是Spring框架中GatewayFilter的实例，使用过滤器，可以在请求被路由前或者之后对请求进行修改。

## 新建gateway网关项目

1、pom文件
```
<!--新增gateway-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>


        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-hystrix</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
```

2、手动配置路由yml文件

```
server:
  port: 9527
spring:
  application:
    name: cloud-gateway
  cloud:
    gateway:
      routes:
        - id: payment_routh #路由的ID，没有固定规则但要求唯一，建议配合服务名
          uri: http://localhost:8001   #匹配后提供服务的路由地址
          predicates:
            - Path=/payment/get/**   #断言,路径相匹配的进行路由

        - id: payment_routh2
          uri: http://localhost:8001
          predicates:
            - Path=/payment/lb/**   #断言,路径相匹配的进行路由


eureka:
  instance:
    hostname: cloud-gateway-service
  client:
    service-url:
      register-with-eureka: true
      fetch-registry: true
      defaultZone: http://eureka7001.com:7001/eureka
```
3、启动类
```
@EnableEurekaClient
@SpringBootApplication
public class GateWayMain9527 {
    public static void main(String[] args) {
        SpringApplication.run( GateWayMain9527.class,args);
    }
}
```

4、使用cloud-provider-payment8001提供者演示提供的controller接口
```
@GetMapping(value = "/payment/get/{id}")
@GetMapping(value = "/payment/lb")
```
5、访问
```
//由gateway路由到对应服务接口
http://localhost:9527/payment/get/31
http://localhost:9527/payment/lb
```

## 手动配置bean路由

以代码形式增加网关路由

```
//访问http://localhost:9527/gn会去到http://news.baidu.com/guonei
@Configuration
public class gatewayConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder routeLocatorBuilder) {
        RouteLocatorBuilder.Builder routes = routeLocatorBuilder.routes();
        routes.route("path_rote_atguigu",
                r -> r.path("/gn").uri("http://news.baidu.com/guonei")).build();
        return routes.build();
    }
}

```

## 动态路由配置

修改gateway服务yml文件

lb是负载均衡@LoadBalanced

```
##手动配置
#server:
#  port: 9527
#spring:
#  application:
#    name: cloud-gateway
#  cloud:
#    gateway:
#      routes:
#        - id: payment_routh #路由的ID，没有固定规则但要求唯一，建议配合服务名
#          uri: http://localhost:8001   #匹配后提供服务的路由地址
#          predicates:
#            - Path=/payment/get/**   #断言,路径相匹配的进行路由
#
#        - id: payment_routh2
#          uri: http://localhost:8001
#          predicates:
#            - Path=/payment/lb/**   #断言,路径相匹配的进行路由


#===============================================
#动态路由，根据服务名称找
server:
  port: 9527
spring:
  application:
    name: cloud-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true  #开启从注册中心动态创建路由的功能，利用微服务名进行路由
      routes:
        - id: payment_routh #路由的ID，没有固定规则但要求唯一，建议配合服务名
          #uri: http://localhost:8001   #匹配后提供服务的路由地址，
          #“lb”是负载均衡，“cloud-payment-service”是服务名称
          uri: lb://cloud-payment-service
          predicates:
            - Path=/payment/get/**   #断言,路径相匹配的进行路由

        - id: payment_routh2
          #uri: http://localhost:8001   #匹配后提供服务的路由地址
          #“lb”是负载均衡，“cloud-payment-service”是服务名称
          uri: lb://cloud-payment-service
          predicates:
            - Path=/payment/lb/**   #断言,路径相匹配的进行路由
eureka:
  instance:
    hostname: cloud-gateway-service
  client:
    service-url:
      register-with-eureka: true
      fetch-registry: true
      defaultZone: http://eureka7001.com:7001/eureka
```
访问http://localhost:9527/payment/lb 实现负载均衡

8、predicates的使用
8.1、可配置的如下
```
Loaded RoutePredicateFactory [After]
Loaded RoutePredicateFactory [Before]
Loaded RoutePredicateFactory [Between]
Loaded RoutePredicateFactory [Cookie]
Loaded RoutePredicateFactory [Header]
Loaded RoutePredicateFactory [Host]
Loaded RoutePredicateFactory [Method]
Loaded RoutePredicateFactory [Path]
Loaded RoutePredicateFactory [Query]
Loaded RoutePredicateFactory [ReadBodyPredicateFactory]
Loaded RoutePredicateFactory [RemoteAddr]
Loaded RoutePredicateFactory [Weight]
Loaded RoutePredicateFactory [CloudFoundryRouteService]
```
8.2、Path路径匹配提供者接口，yml配置
```
predicates:
  - Path=/payment/get/**   #断言,路径相匹配的进行路由
```

8.3、After超过这个时间才能访问

```
//获取时区，运行获取当前时区
public static void main(String[] args) {
        ZonedDateTime zdt = ZonedDateTime.now();//默认时区
        System.out.println(zdt);
}
//yml配置，超过这个时间才能访问接口
- After=2020-05-04T22:03:47.544+08:00[Asia/Shanghai]
```

8.4、其他配置见如下地址
## hystrix的Filter使用

拦截请求、认证、授权、解密、全局日志记录、统一网关鉴权等操作

由两个接口操作,`GlobalFilter ，Ordered`

1、官网以实现单一配置

https://cloud.spring.io/spring-cloud-static/spring-cloud-gateway/2.2.1.RELEASE/reference/html/#gatewayfilter-factories

2、自定义全局配置过滤器，增加一个配置，用来实现连接必须存在uname键才符合放行
```
@Component
@Slf4j
public class MylogGatewayFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {

        log.info("*********come in MyLogGateWayFilter: "+new Date());
        String uname = exchange.getRequest().getQueryParams().getFirst("uname");
        if(uname == null){
            log.info("*****用户名为Null 非法用户,(┬＿┬)");
            //给回应
            exchange.getResponse().setStatusCode(HttpStatus.NOT_ACCEPTABLE);
            return exchange.getResponse().setComplete();
        }
        //放行
        return chain.filter(exchange);
    }


    @Override
    public int getOrder() {
        //值越小优先级越高，下表从0开始，filter保存在集合中
        return 0;
    }
}
```




