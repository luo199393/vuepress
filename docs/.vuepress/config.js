module.exports = {
  title: '山有木兮水',
  description: '云想衣裳花想容，春风拂槛露华浓。若非群玉山头见，会向瑶台月下逢。',
  dest: './dist', // 设置输出目录
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    // 页面icon
    ['link', {
      rel: 'icon',
      href: '/icon.png'
    }],// 增加一个自定义的 favicon(网页标签的图标)
	// add jquert and fancybox
        ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js' }],
        ['script', { src: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.js' }],
        ['link', { rel: 'stylesheet', type: 'text/css', href: 'https://cdnjs.cloudflare.com/ajax/libs/fancybox/3.5.2/jquery.fancybox.min.css' }]
  ],
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  themeConfig: {
    lastUpdated: 'Last Updated', // 文档更新时间：每个文件git最后提交的时间
    // 导航栏配置
    nav:[
      // 下拉列表
	  {
        text: 'springcloud',
        items: [
          { text: 'springcloudH版', link: '/springcloudH/consul' }
        ]
      },
      // 内部链接 以docs为根目录
      { text: 'Vue', link: '/vue/vueVersion' },
      {
        text: 'node',
        items: [
          { text: 'npm和yarn', link: '/node/npmYarn' }
        ]
      },
      // 外部链接
      {
        text: 'Git仓库',
        items: [
          { text: 'GitHub地址', link: 'https://github.com/luo199393' },
        ]
      }        
    ],
    // 侧边栏配置
    sidebar:{
      // docs文件夹下面的vue文件夹 文档中md文件 书写的位置(命名随意)
	  '/springcloudH/': [
        '/springcloudH/consul',
		'/springcloudH/zookeeper',
        '/springcloudH/eureka',
        '/springcloudH/ribbon',
		'/springcloudH/openFeign',
		'/springcloudH/histrix',
		'/springcloudH/gateway',
		'/springcloudH/config',
		'/springcloudH/bus',
		'/springcloudH/Stream',
		{
			title: '例子',
			children: [
				'/springcloudH/Stream'
			]
		}
      ]
    }
  }
};