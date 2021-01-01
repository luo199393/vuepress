## 分布式链路追踪sleuth

官网地址
`https://github.com/spring-cloud/spring-cloud-sleuth`

1、使用

SpringCloud从F版起已不需要自己构建Zipkin server了，只需要调用jar包即可

下载jar包`https://dl.bintray.com/openzipkin/maven/io/zipkin/java/zipkin-server/`

直接运行 java -jar

访问`http://localhost:9411/zipkin/`

2、每个模块加入坐标
```
<!--包含了sleuth+zipkin-->
<dependency>
	<groupId>org.springframework.cloud</groupId>
	<artifactId>spring-cloud-starter-zipkin</artifactId>
</dependency>
```
3、yml增加配置，引入监控地址
```
spring:
  #sleuth采集链路追踪配置，需要搭配启动zipkin使用
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
    #采样率介于0到1之间，1表示全部采集
    probability: 1
```



