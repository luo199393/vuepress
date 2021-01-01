### npm和yarn

>npm
``` js
// 查看 npm 全局安装过的包
npm list -g --depth 0
// 全局安装
npm install -g <package>
// 所有依赖
npm install
// 安装指定版本
npm install <package>@1.2.3
// 安装最新版本
npm i -g <package>@latest
// 删除全局的包
npm uninstall -g <package>
// 删除 node_modules 目录下面的包
npm uninstall <package>
// 删除 node_modules 目录下面的包，并从 package.json 文件中删除
npm uninstall --save <package>
// 更新全局包
npm update -g <package>
// 更新本地安装的包
// 在 package.json 文件所在的目录中执行 npm update 命令
// 执行 npm outdated 命令。不应该有任何输出。
```

>yarn
``` js
// 查看 yarn 全局安装过的包
yarn global list --depth=0
// 全局安装
yarn global add package-name
// 所有依赖
yarn
// 安装指定版本
yarn add package-name@1.2.3
// 安装最新版本
yarn add package-name
// 删除包,会更新package.json和yarn.lock
yarn remove package-name
// 更新包
yarn upgrade
// 更新指定的包
yarn upgrade package-name
// 列出已缓存的包
yarn cache list
// 查找缓存包的路径
yarn cache dir
// 清除缓存的包
yarn cache clean
```

>--save 和 --save-dev 之间的区别
``` js
// 共同点
两种方式都会安装到node_modules目录中。
两种方式都会保存到package.json文件中。
// 区别
// –save
会存放到”dependencies”
--save是对生产环境所需依赖的声明(开发应用中使用的框架，库)
比如：jq，react，vue都需要放到这里面

// –save-dev
会存放到”devDependencies”
--save-dev是对开发环境所需依赖的声明(构建工具，测试工具)
比如：babel，webpack，都放到当前目录
```