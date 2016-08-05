# 项目总结--不断更新

##相册主要功能及实现的简单介绍：

瀑布流展示，木桶布局展示，轮播图展示以及往对应相册内上传照片。

+ 其中主页面除了幽灵按钮外自适应；瀑布流自适应；木桶布局没有做自适应；轮播图定位始终居中。

+ 相册图片有放大查看功能，移入图片有特效，放大功能有限制最大图片尺寸，以免超过屏幕大小；

+ 上传图片页面有上传进度条，两次上传同一张图片检测，图片格式检测。

+ 后台为node，没有用框架，上传部分用了`fileReader`模块，读文件用`fs`模块，默认每次从数据库查询40张图片的信息，从对应相册顺序查询，如果不足40张则从头循环补齐，并把下一次ajax异步加载图片的index值返回给前端，数据格式[index,obj1,obj2,...obj40]，每个图片的数据格式{tag：string,index:number,name:string,src:string}。

+ ajax是自己写的，上传进度条是在xhr对象的upload属性上的oprogress事件设置的

+ mongoDB存储每张照片的信息，数据原型格式{"tag":string,"name":string,"index":number,"src":string}。

+ 一共有5个测试相册，用`localStorage`来完成网页之间的信息传递，每种布局通过从`localStorage`中读取相册名字，到后台拿照片，如果localStorage的albumTag的值为空，则默认设置为'测试相册'，其中轮播图展示默认为测试相册2。

+ 照片加载过程做了预加载和进度条，不会出现加载半个图片的现象。相册里的照片不缓存，每次都去服务器拿。

##项目目录结构：

	-img_service
		--backimg
			---存放的是首页的背景图片以及相册封面图
		-- css			
			--- aside.css 侧边返回顶部按钮和返回主页按钮样式
			---banner.css 轮播图样式
			---barrel.css 木桶布局样式
			---index.css 主页面样式
			---mask.css 遮罩层样式
			---upload.css 上传页面样式
			---waterfall.css 瀑布流布局样式
		--html
	    	---index.html 主页面
	    	---waterfall.html 瀑布流页面
	    	---barrel.html 木桶布局页面
	    	---upload_new.html 上传页面
	    	---banner.html 轮播图页面
		--js
			---node_modules		
			---index_new.js  主页面
			---barrel.js  木桶布局
			---waterfall.js  瀑布流
			---show.js  轮播图
			---mask.js  放大遮罩层				
			---xhr.js  ajax
			---aside.js  侧边返回顶部按钮和返回主页按钮
		以下是后台部分
			---server.js  start()函数,创建http服务，并调用路由函数
			---router.js  把事件名对应到处理程序的函数
			---requestHandlers.js  后台处理函数文件
			---album.json 相册名字与对应存储路径
			---model.js  数据库数据模型

		--index.js  后台入口程序，处理程序以对象形式存储到handle里

		--img  相册图片
		--img2 相册图片
		--img3 相册图片
		--img4 相册图片
		--img5 相册图片

## index.html页面

前端页面加载过程中资源的获取是并行执行的，除了script的js加载，它会阻塞并行加载，也会阻塞页面的渲染，因此script标签要放在页面的底部；而css文件要放在页面顶部，head标签中，因为页面的是逐步加载的，而使用了css样式后，会导致页面重绘，对于不同的浏览器有不同的表现，有的为白屏而有的为无样式闪烁，但是放在页面顶部先加载出来则会是页面逐步呈现。

功能：主页面缓存js和css文件，页面加载进度条，鼠标拖影，轮播的自适应实现，幽灵按钮

# 缓存相关

## Http头部信息

以请求index.html页面为例。

**前端请求头：**

GET /html/index.html HTTP/1.1
HOST:localhost:3000 发出请求的主机所在的域
Connection:keep-alive
UPgrade-Insecure-Requests:1 
User-Agent:用户代理字符串
Accept:浏览器能够处理的内容类型 MIME
Referer:发出请求的页面的URI
Accept-Encoding:能够处理的压缩编码
Accept-Language:浏览器当前设置的语言

简单说一下URI和URL的区别：
URL:统一资源定位符，指的是互联网上的资源定位，每个资源都有唯一的URL
URI:统一资源标识符，可以是互联网上的资源也可以是本地资源
URL需要说明如何访问一个资源，例如"http"
URI表示请求服务器的路径
URL是URI的子集，URI可以表示一个域也可以表示一个资源，而URL只能表示一个资源。

##前端响应头:##

HTTP/1.1 200 OK
Content-Type:text/html
Date:
Connection:keep-alive
Transfer-Encoding:chunked

## 浏览器的缓存机制

浏览器的缓存机制是HTTP协议规定的，主要缓存方法有：Expires,Cache-Control

浏览器的缓存过程：缓存主要分为强缓存和协商缓存，从浏览器第一次去请求一个页面结束后，再次发起请求时说起

（1）首先，浏览器会在请求资源的头部信息（header）中查找是否含有Expires字段和Cache-Control字段，如果含有并没有过期，命中强缓存，则直接使用缓存中的资源，并获取缓存资源的header信息，本次请求不会与服务器进行通信。

Expires字段和Cache-Control字段的区别：

Expires字段是一个绝对时间，它要求客户端和服务端的时间严格同步。

Cache-Control字段有很多属性值，其中max-age=3600(s)是一个相对时间，代表资源的有效期，其他值：

no-cache：不使用本地缓存

no-store：禁止浏览器缓存数据

public：允许所有用户缓存

private：只能被终端浏览器缓存

Cache-Control和Expires可以同时设置，但是Cache-Control的优先级高，Cache-Control的使用较广泛。

（2）如果没有命中强缓存，则浏览器会发送一个GET请求去确认缓存中的资源是否可用，如果服务器确认完资源可用，回复304状态好，则浏览器从缓存中获取资源，此次通信只有响应头，没有响应体。若资源不可用则返回新的资源。

（3）下面详细说明，浏览器和服务器是怎么确认缓存资源可以使用。

**第一种：前端：If-Modified-Since字段  后台：Last-Modified字段**

在第一次请求过后，服务器端会返回Last-Modified字段，标识该资源的最后更改时间，当浏览器再次请求该资源时，会发送一个If-Modified-Since字段，该值就为返回的Last-Modified的值，服务器根据收到的If-Modified-Since字段判断是否资源被修改，如果未被修改，则返回304，不返回资源，并且不会返回If-Modified-Since字段

**第二种：前端：Etag  后台：If-None-Match**

Etag在不同服务器上的默认格式不同，如果说一个网站建设在多个服务器上，则从两个服务器的Etag是不同的，导致相同资源在不同服务器上会被判成不同资源，而不能用缓存。因此要配置Etag格式，使得不同服务器上的格式相同。协商过程与第一种一致。这种方法的优先级要高。
 

## 缓存方面的工作

1. 目前在服务器上设置js和css的缓存时间为1天 回复头中添加了'Cache-Control':'max-age=86400'
2. max-age=0在request中和response中意义是不同的
在request中，头部的max-age=0表示强制要求服务器返回新的资源，在response中，头部的max-age=0表示要求浏览器获取资源要先问服务器，服务器如果回复304，则可以使用缓存，否则服务器返回新的资源。**我一直都是F5刷新，所以不能调用缓存，新开窗口就可以**
3. 浏览器是否缓存资源还与用户的操作有关

+ 要开启缓存 disabled-cache不能勾上

+ 是否用缓存还用用户的操作有关

<table>
	<tr>
		<td>用户操作</td>
		<td>Expires/Cache-Contrl</td>
		<td>Last-Modified/Etag</td>
	</tr>
	<tr>
		<td>地址栏回车</td>
		<td>有效</td>
		<td>有效</td>
	</tr>
	<tr>
		<td>页面链接跳转</td>
		<td>有效</td>
		<td>有效</td>
	</tr>
	<tr>
		<td>新开窗口</td>
		<td>有效</td>
		<td>有效</td>
	</tr>
	<tr>
		<td>前进、后退</td>
		<td>有效</td>
		<td>有效</td>
	</tr>
	<tr>
		<td>F5刷新</td>
		<td>无效</td>
		<td>有效</td>
	</tr>
	<tr>
		<td>Ctrl+F5刷新</td>
		<td>无效</td>
		<td>无效</td>
	</tr>
</table>

## 页面的布局以及样式设置


