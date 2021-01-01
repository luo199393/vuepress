## consul注册中心
```
使用docker-compose部署consul集群
建立compose文件consul.yml
docker-compose文件如下：

version: '3.6'

services:
  consul1: 
    image: consul:latest
    container_name: consul1
    restart: always
    command: agent -server -client=0.0.0.0 -bootstrap-expect=3 -node=consul1 -datacenter=dc1
  consul2:
    image: consul:latest
    container_name: consul2
    restart: always
    command: agent -server -client=0.0.0.0 -retry-join=consul1 -node=consul2 -datacenter=dc1
  consul3:
    image: consul:latest
    container_name: consul3
    restart: always
    command: agent -server -client=0.0.0.0 -retry-join=consul1 -node=consul3 -datacenter=dc1
  consul4:
    image: consul:latest
    container_name: consul4
    restart: always
    ports:
      - 8500:8500
    command: agent -client=0.0.0.0 -retry-join=consul1 -ui -node=client1 -datacenter=dc1
  consul5:
    image: consul:latest
    container_name: consul5
    restart: always
    command: agent -server -client=0.0.0.0 -bootstrap-expect=3 -node=consul5 -datacenter=dc2
  consul6:
    image: consul:latest
    container_name: consul6
    restart: always
    command: agent -server -client=0.0.0.0 -retry-join=consul5 -node=consul6 -datacenter=dc2
  consul7:
    image: consul:latest
    container_name: consul7
    restart: always
    command: agent -server -client=0.0.0.0 -retry-join=consul5 -node=consul7 -datacenter=dc2
  consul8:
    image: consul:latest
    container_name: consul8
    restart: always
    ports:
      - 8501:8500
    command: agent -client=0.0.0.0 -retry-join=consul5 -ui -node=client2 -datacenter=dc2

可以看到network_mode是我自己建立的一个网段，也可以使用已有的网段，建立网段的命令如下：
docker network create --driver bridge --subnet 10.10.0.0/24  mynet

docker-compose up -d 启动

我们这里部署了两个数据中心，使用命令查看各自数据中心的成员：
//以consul1为例
$ docker exec consul1 consul members

 Node     Address          Status  Type    Build  Protocol  DC   Segment
consul1  172.19.0.6:8301  alive   server  1.4.0  2         dc1  <all>
consul2  172.19.0.8:8301  alive   server  1.4.0  2         dc1  <all>
consul3  172.19.0.5:8301  alive   server  1.4.0  2         dc1  <all>
client   172.19.0.2:8301  alive   client  1.4.0  2         dc1  <default>


可以看到显示了dc1数据中心的所有角色。
而数据中心的WAN池只显示server的成员，想要两个数据中心之间建立通信，只需要加入同一个WAN池就可以，命令如下：

//以dc1为例，加入dc2
$ docker exec consul1 consul join -wan consul5

查看WAN池的成员：
docker exec consul1 consul members -wan

打印如下：

Node         Address          Status  Type    Build  Protocol  DC   Segment
consul1.dc1  172.19.0.6:8302  alive   server  1.4.0  2         dc1  <all>
consul2.dc1  172.19.0.8:8302  alive   server  1.4.0  2         dc1  <all>
consul3.dc1  172.19.0.5:8302  alive   server  1.4.0  2         dc1  <all>
consul5.dc2  172.19.0.4:8302  alive   server  1.4.0  2         dc2  <all>
consul6.dc2  172.19.0.7:8302  alive   server  1.4.0  2         dc2  <all>
consul7.dc2  172.19.0.3:8302  alive   server  1.4.0  2         dc2  <all>

[查看链接使用](https://blog.csdn.net/qq_24384579/article/details/86480522)
```