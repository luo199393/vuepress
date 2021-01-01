## stream

1、中英文官网
https://m.wang1314.com/doc/webapp/topic/20971999.html

https://cloud.spring.io/spring-cloud-static/spring-cloud-stream/3.0.1.RELEASE/reference/html/

设计思想

2、标准MQ
<a data-fancybox title="标准MQ" href="/springcloudh/stream/标准MQ.bmp">![标准MQ](/springcloudh/stream/标准MQ.bmp "标准MQ")</a>

2.1、生产者/消费者之间靠消息媒介传递信息内容 Message
	
2.2、消息必须走特定的通道，消息通道MessageChannel
	
2.3、消息通道里的消息如何被消费呢，谁负责收发处理，消息通道MessageChannel的子接口SubscribableChannel,由MessageHandler消息处理器订阅
  
3、为什么用Cloud Stream

3.1、 stream凭什么可以统一底层差异

3.2、Binder包含 INPUT对应于消费者 和 OUTPUT对应于生产者
<a data-fancybox title="Binder架构图" href="/springcloudh/stream/Binder架构图.PNG">![Binder架构图](/springcloudh/stream/Binder架构图.PNG "Binder架构图")</a>

 
4、Stream中的消息通信方式遵循了发布-订阅模式

4.1、Topic主题进行广播，两种中间件为，在RabbitMQ就是Exchange，在kafka中就是Topic

5、Spring Cloud Stream标准流程套路

<a data-fancybox title="标准流程" href="/springcloudh/stream/标准流程.bmp">![标准流程](/springcloudh/stream/标准流程.bmp "标准流程")</a>

5.1、Binder

很方便的连接中间件，屏蔽差异

5.、Channel

通道，是队列Queue的一种抽象，在消息通讯系统中就是实现存储和转发的媒介，通过对Channel对队列进行配置

5.、Source和Sink

简单的可理解为参照对象是Spring Cloud Stream自身，从Stream发布消息就是输出，接受消息就是输入

6、常用注解

<a data-fancybox title="stream注解" href="/springcloudh/stream/stream注解.bmp">![stream注解](/springcloudh/stream/stream注解.bmp "stream注解")</a>


## 消息提供者

cloud-stream-rabbitmq-provider8801,作为生产者进行发消息模块

1、pom文件
```
<dependencies>
	<dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-stream-rabbit</artifactId>
	</dependency>
	<!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-eureka-server -->
	<dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
	</dependency>
	<dependency>
		<groupId>com.atguigu.springcloud</groupId>
		<artifactId>cloud-api-commons</artifactId>
		<version>${project.version}</version>
		<scope>compile</scope>
	</dependency>
	<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-web</artifactId>
	</dependency>
	<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-web -->
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-actuator</artifactId>
	</dependency>
	<!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
	<dependency>
		<groupId>org.projectlombok</groupId>
		<artifactId>lombok</artifactId>
		<optional>true</optional>
	</dependency>
	<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-test -->
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-test</artifactId>
		<scope>test</scope>
	</dependency>
</dependencies>
```

2、yml配置
```
server:
  port: 8801

spring:
  application:
    name: cloud-stream-provider
  cloud:
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 192.168.1.102
                port: 5672
                username: guest
                password: guest
      bindings: # 服务的整合处理
        output: # 这个名字是一个通道的名称,生产者使用output，消费者使用input
          destination: studyExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设置“text/plain”
          binder: defaultRabbit  # 设置要绑定的消息服务的具体设置

eureka:
  client: # 客户端进行Eureka注册的配置
    service-url:
      defaultZone: http://localhost:7001/eureka
  instance:
    lease-renewal-interval-in-seconds: 2 # 设置心跳的时间间隔（默认是30秒）
    lease-expiration-duration-in-seconds: 5 # 如果现在超过了5秒的间隔（默认是90秒）
    instance-id: send-8801.com  # 在信息列表时显示主机名称
    prefer-ip-address: true     # 访问的路径变为IP地址

```

3、main入口
```
@EnableEurekaClient
@SpringBootApplication
public class StreamMQMain8801 {
    public static void main(String[] args) {
        SpringApplication.run(StreamMQMain8801.class,args);
    }
}
```

4、业务接口
```
public interface IMessageProvider {

    String send();
}
```
5、实现业务接口
```
import com.atguigu.springcloud.service.IMessageProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.stream.annotation.EnableBinding;
import org.springframework.cloud.stream.messaging.Source;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.MessageChannel;

import java.util.UUID;

/**
 * @author lzf
 * @create 2020-05-08 22:31
 */
@EnableBinding(Source.class) //定义消息的推送管道
public class MessageProviderImpl implements IMessageProvider {

    @Autowired
    private MessageChannel output; // 消息发送管道

    @Override
    public String send() {
        String serial = UUID.randomUUID().toString();
        output.send(MessageBuilder.withPayload(serial).build());
        System.out.println("生产者*******serial"+serial);
        return serial;
    }
}

```
6、调用接口发送消息到rabbit,
```
@RestController
public class SendMessageController {

    @Autowired
    private IMessageProvider iMessageProvider;

    @GetMapping(value = "/sendMessage")
    public String sendMessage(){
        return iMessageProvider.send();
    }
}
```

## 消息消费者模块

cloud-stream-rabbitmq-consumer8802,作为消息接收模块

1、pom文件
```
<dependencies>
	<dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-stream-rabbit</artifactId>
	</dependency>
	 <dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
	</dependency>
	<dependency>
		<groupId>com.atguigu.springcloud</groupId>
		<artifactId>cloud-api-commons</artifactId>
		<version>${project.version}</version>
		<scope>compile</scope>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-web</artifactId>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-actuator</artifactId>
	</dependency>
	<dependency>
		<groupId>org.projectlombok</groupId>
		<artifactId>lombok</artifactId>
		<optional>true</optional>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-test</artifactId>
		<scope>test</scope>
	</dependency>
</dependencies>
```

2、yml配置

```
server:
  port: 8802

spring:
  application:
    name: cloud-stream-consumer
  cloud:
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 101.37.13.136
                port: 5672
                username: admin
                password: 123456
      bindings: # 服务的整合处理
        input: # 这个名字是一个通道的名称,消费者为input，生产者为output
          destination: studyExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为json，文本则设置“text/plain”
          binder: defaultRabbit  # 设置要绑定的消息服务的具体设置
eureka:
  client: # 客户端进行Eureka注册的配置
    service-url:
      defaultZone: http://localhost:7001/eureka
  instance:
    lease-renewal-interval-in-seconds: 2 # 设置心跳的时间间隔（默认是30秒）
    lease-expiration-duration-in-seconds: 5 # 如果现在超过了5秒的间隔（默认是90秒）
    instance-id: receive-8802.com  # 在信息列表时显示主机名称
    prefer-ip-address: true     # 访问的路径变为IP地址
```

3、接受消息
```
@Component
@EnableBinding(Sink.class)
public class ReceiveMessageListennerController {

    @Value("${server.port}")
    private String serverPort;

    @StreamListener(Sink.INPUT)//配置文件指定 input
    public void input(Message<String> message){
        System.out.println("收到的消息--------"+message.getPayload()+"端口号"+serverPort);
    }

}
```
4、调用消息提供者，查看8802消费者是否能接收到消息


## 分组消费与持久化

cloud-stream-rabbitmq-consumer8803,作为消息接收模块

复制一份cloud-stream-rabbitmq-consumer8802模块改为8803

1、pom文件按照cloud-stream-rabbitmq-consumer8802

2、yml
```
server:
  port: 8803
spring:
  application:
    name: cloud-stream-consumer
  cloud:
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 101.37.13.136
                port: 5672
                username: admin
                password: 123456
      bindings: # 服务的整合处理
        input: # 这个名字是一个通道的名称
          destination: studyExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为对象json，如果是文本则设置“text/plain”
          binder: defaultRabbit # 设置要绑定的消息服务的具体设置
          #group: group1 #增加分组,消费者分组名称相同才不会造成集群消费者重复消费
eureka:
  client: # 客户端进行Eureka注册的配置
    service-url:
      defaultZone: http://localhost:7001/eureka
  instance:
    lease-renewal-interval-in-seconds: 2 # 设置心跳的时间间隔（默认是30秒）
    lease-expiration-duration-in-seconds: 5 # 如果现在超过了5秒的间隔（默认是90秒）
    instance-id: receive-8803.com  # 在信息列表时显示主机名称
    prefer-ip-address: true     # 访问的路径变为IP地址
```

3、问题，消费者是集群，解决重复消费问题

微服务应用放置于同一个group中，就能够保证消息只会被其中一个应用消费一次。
不同的组是可以同时被多个消费者消费的，同一个组内会发生竞争关系，只有其中一个可以消费

8802和8803的yml配置增加group分组,消费者分组名相同才不会造成重复消费
```
spring:
  application:
    name: cloud-stream-consumer
  cloud:
    stream:
      binders: # 在此处配置要绑定的rabbitmq的服务信息；
        defaultRabbit: # 表示定义的名称，用于于binding整合
          type: rabbit # 消息组件类型
          environment: # 设置rabbitmq的相关的环境配置
            spring:
              rabbitmq:
                host: 101.37.13.136
                port: 5672
                username: admin
                password: 123456
      bindings: # 服务的整合处理
        input: # 这个名字是一个通道的名称
          destination: studyExchange # 表示要使用的Exchange名称定义
          content-type: application/json # 设置消息类型，本次为对象json，如果是文本则设置“text/plain”
          binder: defaultRabbit # 设置要绑定的消息服务的具体设置
          group: group1 #增加分组,消费者分组名称相同才不会造成集群消费者重复消费
```

## 消息持久化

需要增加自定义分组才能重复消费

1、消费者配置文件增加group分组并且关闭消费者

2、消息生产者发送消息

3、启动消费者重新获取消息消费

