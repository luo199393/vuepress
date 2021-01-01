## zookeeper注册中心

1、使用docker搭建zookeeper集群，使用docker-compose启动镜像，关闭防火墙，注意版本号

### 单节点配置
```
version: '3.1'
services:
    zoo1:
        image: zookeeper:3.4.13
        restart: always
        hostname: zoo1
        ports:
            - 2181:2181
        environment:
            ZOO_MY_ID: 1
            ZOO_SERVERS: server.1=zoo1:2888:3888
```

### 伪集群配置

编写docker-compose.yml，内容如下，编写完使用```docker-compose up -d``` 后台运行
多主机搭建，和单机版启动一样，只需要分别启动一个zookeeper，在docker-compose.yml下的ZOO_SERVERS节点填写各个主机地址就行
```
version: '3.1'
services:
    zoo1:
        image: zookeeper:3.4.13
        restart: always
        hostname: zoo1
        ports:
            - 2181:2181
        environment:
            ZOO_MY_ID: 1
            ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888

    zoo2:
        image: zookeeper:3.4.13
        restart: always
        hostname: zoo2
        ports:
            - 2182:2181
        environment:
            ZOO_MY_ID: 2
            ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888

    zoo3:
        image: zookeeper:3.4.13
        restart: always
        hostname: zoo3
        ports:
            - 2183:2181
        environment:
            ZOO_MY_ID: 3
            ZOO_SERVERS: server.1=zoo1:2888:3888 server.2=zoo2:2888:3888 server.3=zoo3:2888:3888
```		

4、编写一个提供者springboot项目

application.yml编写如下,这里启动两个实例8004和8005端口项目，顺便演示@LoadBalanced效果

```
server:
  port: 8004

spring:
  application:
    name: cloud-zookeeper-provider-payment
  cloud:
    zookeeper:
      connect-string: 192.168.1.102:2181,192.168.1.102:2182,192.168.1.102:2183

  profiles: cloud-zookeeper-provider-payment8004

---
server:
  port: 8005

spring:
  application:
    name: cloud-zookeeper-provider-payment
  cloud:
    zookeeper:
      connect-string: 192.168.1.102:2181,192.168.1.102:2182,192.168.1.102:2183

  profiles: cloud-zookeeper-provider-payment8005
```

pom.xml如下
```
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>cloud2020</artifactId>
        <groupId>com.atguigu.springcloud</groupId>
        <version>1.0-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>cloud-zookeeper-provider-payment8004</artifactId>


    <dependencies>

        <dependency>
            <groupId>com.atguigu.springcloud</groupId>
            <artifactId>cloud-api-commons</artifactId>
            <version>${project.version}</version>
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

        <!-- https://mvnrepository.com/artifact/org.springframework.cloud/spring-cloud-starter-zookeeper-discovery -->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-zookeeper-discovery</artifactId>
            <!--排除zk3.5.3-->
            <exclusions>
                <exclusion>
                    <groupId>org.apache.zookeeper</groupId>
                    <artifactId>zookeeper</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <!--添加zk 3.4,13版本,注意这里要和虚拟机启动的zookeeper版本一致-->
        <!-- https://mvnrepository.com/artifact/org.apache.zookeeper/zookeeper -->
        <dependency>
            <groupId>org.apache.zookeeper</groupId>
            <artifactId>zookeeper</artifactId>
            <version>3.4.13</version>
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

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <mainClass>com.atguigu.springcloud.PaymentMain8004</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>


```	  

启动类添加注解注册金zookeeper注册中心
@EnableDiscoveryClient


5、编写一个消费者springboot项目

application.yml如下

```
server:
  port: 80

spring:
  application:
    name: cloud-zookeeper-consumer-order
  cloud:
    zookeeper:
      connect-string: 192.168.1.102:2181,192.168.1.102:2182,192.168.1.102:2183

```

新建一个配置类ApplicationContextConfig

```
@Configuration
public class ApplicationContextConfig {

    @LoadBalanced
    @Bean
    public RestTemplate getRestTemplate(){
        return new RestTemplate();
    }

}
```

新建一个controller类,按照配置类自动负载均衡访问提供

```
@RestController
@Slf4j
public class OrderZKController {

    public static final String INVOME_URL = "http://cloud-zookeeper-provider-payment";


    @Resource
    private RestTemplate restTemplate;

    @GetMapping("/consumer/payment/zk")
    public String payment (){
        String result = restTemplate.getForObject(INVOME_URL+"/payment/zk",String.class);
        return result;
    }


}
```

使用http://localhost/consumer/payment/zk访问，输入内容包含两个端口号证明成功
springcloud with zookeeper:8005 39adfeb1-6e07-4f8c-84fd-0a5d8c21d9f5
springcloud with zookeeper:8004 5a6c33b0-02cb-44e4-96aa-8b9bcd120134

6、zookeeper查看注册进的服务

  
  dokcer进入容器里，查看注册到zookeeper容器注册进有哪些服务
  输入 ./bin/zkCli.sh  在输入 ls /  输出如下
  
  [services, zookeeper]
  在输入 ls /services   输出如下为注册进zookeeper的服务名称
  
  [cloud-zookeeper-consumer-order, cloud-zookeeper-provider-payment]

7、查看zookeeper集群是否搭建成功
  进入容器docker exec -it docker_zoo3_1 /bin/bash
  查看集群状态输入./bin/zkServer.sh status，输出如下，从节点Mode显示follower，则集群ok
	ZooKeeper JMX enabled by default
	Using config: /conf/zoo.cfg
	Mode: leader