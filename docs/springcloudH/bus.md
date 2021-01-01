## bus搭配config使用

使用rabbitmq广播通知给各个服务刷新配置,

设计思想
  1) 利用消息总线触发一个客户端/bus/refresh,而刷新所有客户端的配置
  
  2) 利用消息总线触发一个服务端ConfigServer的/bus/refresh端点,而刷新所有客户端的配置（更加推荐）
  
流程图
<a data-fancybox title="bus和config传播更新配置文件" href="/springcloudh/bus/bus和config传播更新配置文件.PNG">![bus和config传播更新配置文件](/springcloudh/bus/bus和config传播更新配置文件.PNG "bus和config传播更新配置文件")</a>

1、启动虚拟机，使用docker运行rabbitmq,默认账号密码guest/guest

参考链接https://www.rabbitmq.com/download.html

```
version: '3'
services:
  rabbit1:
    image: rabbitmq:3-management
    container_name: rabbitmq
    ports:
      - "4369:4369"
      - "5671:5671"
      - "5672:5672"
      - "15671:15671"
      - "15672:15672"
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=123456
    restart: always
````

2、新建项目 cloud-config-client-3377

3、pom文件
```
<dependencies>
	<dependency>
		<groupId>org.springframework.cloud</groupId>
		<artifactId>spring-cloud-starter-config</artifactId>
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

4、bootstrap.yml
```
server:
  port: 3366
spring:
  application:
    name: config-client
  cloud:
    config:
      label: master
      name: config
      profile: dev
      uri: http://localhost:3344
eureka:
  client:
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

5、config的server端cloud-config-center-3344模块增加pom坐标
```
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>
```

6、cloud-config-center-3344d模块修改yml
```
server:
  port: 3344
spring:
  application:
    name: cloud-config-center
  cloud:
    config:
      server:
        git:
          uri: git@github.com:luo199393/springcloud-config.git
          search-paths:
            - springcloud-config
      label: master
  #解决获取github仓库内容中文乱码问题
  http:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
  #bus搭配config
  rabbitmq:
    host: 192.168.1.102
    port: 5672
    username: guest
    password: guest
eureka:
  client:
    service-url:
      defaultZone:  http://localhost:7001/eureka
#rabbitmq相关配置，暴漏bus刷新配置的断电
management:
  endpoints:
    web:
      exposure:
	  #由cloud-config-client3344服务负责刷新广播给全部服务通知更新yml配置
        include: 'bus-refresh'
```

7、cloud-config-client3366和cloud-config-client3377模块增加yml和pom坐标
```
//增加pom坐标
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-bus-amqp</artifactId>
</dependency>

//增加yml配置
#bus搭配config
  rabbitmq:
    host: 192.168.1.102
    port: 5672
    username: guest
    password: guest
```

8、启动3344、3366、3377三个模块

	8.1、访问三个服务获取配置文件信息
	
		http://localhost:3366/configInfo  
		
		http://localhost:3377/configInfo
		
		http://localhost:3344/master/config-dev.yml
		
	8.2、在github修改配置文件内容
	
	8.3、使用命令刷新配置，一对多广播更新
	
	curl -X POST "http://localhost:3344/actuator/bus-refresh"
	
	8.4、再次访问上面路径查看最新配置是否更新，如果更新则ok
	
9、定点更新某个服务的配置

  指定具体某一个实例生效而不是全部
  
  公式：http://localhost:配置中心的端口号/actuator/bus-refresh/{destination}
  
  /bus/refresh请求不再发送到具体的服务实例上，而是发给config server并通过destination参数类指定需要更新配置的服务或实例