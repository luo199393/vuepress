## config分布式配置中心

官网地址

https://cloud.spring.io/spring-cloud-static/spring-cloud-config/2.2.1.RELEASE/reference/html/

## config服务端配置

用来存储yml配置文件

1、github新建仓库

2、新建项目cloud-config-center-3344

3、pom文件

```
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-config-server</artifactId>
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
```

4、yml配置
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
          #使用git连接需要在github添加自己电脑的ssh
          uri: git@github.com:luo199393/springcloud-config.git
          search-paths:
            - springcloud-config
      label: master
  #浏览器查看获取github仓库内容中文乱码问题
  http:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
eureka:
  client:
    service-url:
      defaultZone:  http://localhost:7001/eureka
```

5、启动类
```
@EnableConfigServer
@SpringBootApplication
public class ConfigCenterMain3344 {
    public static void main(String[] args) {
        SpringApplication.run(ConfigCenterMain3344 .class,args);
    }
}
```

6、访问路径获取ymlneirong

http://localhost:3344/master/config-test.yml

7、获取分支方式

/{label}/{application}-{profile}.yml  最推荐使用这种方式

7.1、master分支

http://config-3344.com:3344/master/config-dev.yml

http://config-3344.com:3344/master/config-test.yml

http://config-3344.com:3344/master/config-prod.yml

7.2、dev分支，获取dev分支,需要创建dev分支

http://config-3344.com:3344/dev/config-dev.yml

http://config-3344.com:3344/dev/config-test.yml

http://config-3344.com:3344/dev/config-prod.yml
	
8、获取分支方式2

/{application}-{profile}.yml

http://config-3344.com:3344/config-dev.yml

http://config-3344.com:3344/config-test.yml

http://config-3344.com:3344/config-prod.yml

http://config-3344.com:3344/config-xxxx.yml(不存在的配置)
  
9、获取分支方式3，可以获取到文件详细信息

/{application}-{profile}[/{label}]

http://config-3344.com:3344/config/dev/master

http://config-3344.com:3344/config/test/master

http://config-3344.com:3344/config/prod/master

## config客户端配置

1、新建项目cloud-config-center-3344

2、pom文件
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

3、新建bootstrap.yml配置文件

```
server:
  port: 3355
spring:
  application:
    name: config-client
  cloud:
    config:
      label: master #分支名称
      name: config #配置文件名称
      profile: dev  #读取配置文件后缀
      uri: http://localhost:3344
eureka:
  client:
    service-url:
      defaultZone: http://eureka7001.com:7001/eureka
```

4、编写接口获取config服务配置

```
@RestController
public class ConfigClientController {

	//获取config配置文件内容
    @Value("${config.dev}")
    private String configInfo;

    @GetMapping("/configInfo")
    public String getConfigInfo(){
        return configInfo;
    }
}
```

5、访问上面接口获取文件内容，可以把配置文件都放在config服务中，然后读取服务对应配置文件


## config动态刷新获取新配置文件

解决不用重启config服务端，客户端动态获取新的配置文件

1、yml增加配置
```
#暴漏监控地址
management:
  endpoints:
    web:
      exposure:
        include: "*"
```

2、接口增加刷新注解`@RefreshScope //config动态刷新配置`

3、发送post请求执行刷新操作,`curl -X POST "http://localhost:3366/actuator/refresh"`

4、建议结合spring cloud Bus使用

