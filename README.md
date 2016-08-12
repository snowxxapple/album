# 项目总结--不断更新

# 相册主要功能及实现的简单介绍：

[项目地址:https://github.com/snowxxapple/album.git](https://github.com/snowxxapple/album.git)
[项目展示:http://album.crystalxue.com](http://album.crystalxue.com)

瀑布流展示，木桶布局展示，轮播图展示以及往对应相册内上传照片。

+ 其中主页面除了幽灵按钮外自适应；瀑布流自适应；木桶布局没有做自适应；轮播图定位始终居中。

+ 相册图片有放大查看功能，移入图片有特效，放大功能有限制最大图片尺寸，以免超过屏幕大小；

+ 上传图片页面有上传进度条，两次上传同一张图片检测，图片格式检测。

+ 后台为node，没有用框架，上传部分用了`fileReader`模块，读文件用`fs`模块，默认每次从数据库查询40张图片的信息，从对应相册顺序查询，如果不足40张则从头循环补齐，并把下一次ajax异步加载图片的index值返回给前端，数据格式[index,obj1,obj2,...obj40]，每个图片的数据格式{tag：string,index:number,name:string,src:string}。

+ ajax是自己写的，上传进度条是在xhr对象的upload属性上的oprogress事件设置的

+ mongoDB存储每张照片的信息，数据原型格式{"tag":string,"name":string,"index":number,"src":string}。

+ 一共有5个测试相册，用`localStorage`来完成网页之间的信息传递，每种布局通过从`localStorage`中读取相册名字，到后台拿照片，如果localStorage的albumTag的值为空，则默认设置为'测试相册'，其中轮播图展示默认为测试相册2。

+ 照片加载过程做了预加载和进度条，不会出现加载半个图片的现象。相册里的照片不缓存，每次都去服务器拿。

# 项目目录结构：

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

# index.html index.css index_new.js

**功能：主页面缓存js和css文件、页面加载进度条、自适应布局、自适应轮播图、下拉列表、鼠标拖影、梯形图片剪裁、鼠标移入提示框显示、幽灵按钮、回到顶部按钮、打字特效**

前端页面加载过程中资源的获取是并行执行的，除了script的js加载，它会阻塞并行加载，也会阻塞页面的渲染，因此script标签要放在页面的底部；而css文件要放在页面顶部，head标签中，因为页面的是逐步加载的，而使用了css样式后，会导致页面重绘，对于不同的浏览器有不同的表现，有的为白屏而有的为无样式闪烁，但是放在页面顶部先加载出来则会是页面逐步呈现。

## 获取页面大小

要声明文档模式，才能准确获取页面大小

`!doctype html` 标准模式

可视区大小：`document.documentElement.clientWidth`

文档大小：`document.body.clientWidth`

混杂模式下就不一定了，和浏览器还有关

## 缓存相关

### Http头部信息

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

**前端响应头:**

HTTP/1.1 200 OK
Content-Type:text/html
Date:
Connection:keep-alive
Transfer-Encoding:chunked

### 浏览器的缓存机制

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
 

### 缓存方面的工作

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

4.页面进度条

应用html页面顺序加载的原理，在页面不同地方插入了节点来更改`progress`标签的`value`值。

# 页面的布局以及样式设置

所有元素初始化外边距和内边距，盒模型采用IE和模型，`body`上鼠标形状用`cursor:url()`，改成雪花形状，同时禁止横向滚动条（幽灵按钮的四条边）

## 自适应页面

对元素的宽度和高度设置都采用百分比的形式，这样可以实现自适应。对宽度直接设置百分比，就会以屏幕宽度的百分比来显示，对于高度，监听`window.onresize`事件，当屏幕更改大小时，调用`Album.init(height,obj)`函数（height为当前屏幕宽度，`obj`为要更改的元素），更改容器`<div class='album'>`的元素大小

## 导航条

导航条`nav`标签，右侧点击项`div`右浮动，为了整个鼠标移入有特效，导航项用`<a>`来实现，下拉列表仿照bootstrap的效果做的,鼠标移入整个特效，因此也采用`<a>`标签来实现。禁止`a`的链接方式：`<a href="javascript:;"></a>`。

连接列表是一个`div`，点击相册列表以`display`的值来出现和消失。设置了一个标志位来表示当前下拉列表当前的状态，运用三目运算符来确定当前是否显示`oUl.style.display=oUl.style.display=='block'?'none':'block';`。在`body`上添加了`click`事件，运用的是事件委托原理，根据`target.ev`来判断点击元素，对应相应的处理程序，下拉列表的处理程序是`drop()`

## logo震动雪花效果

+ 震动效果：

css3实现，定义了一个`buzz`动画，`@keyframes buzz`，在`.logo:hover`时添加动画，`animation:buzz 1s ease 0s 1 normal`

+ 雪花效果

这个做的不好，用的数组给的雪花位置定值，应用`transition`动起来。

## 图片链接到对应相册

项目中页面间的通信用的是`localStorage`来完成的。过程：index.html加载时，会先判断页面的`localStorage`中的`albumTag`的属性值是否为空，如果为空，则设置为"测试相册"，这样避免了加载别的相册页面时`localStorage`为空的现象。

把每个相册封面对应链接地址存入数组，把每个相册对应`albumTag`也存入数组，给每个相册封面添加了index属性，以便点击的时候方便去数组中查找对应值。

```javascript
function turn(tag) {
                localStorage.setItem("albumTag", albumTag[tag.index]);
                console.log(localStorage['albumTag'], 'albumTag');
                window.location = albumAdress[tag.index];
            }
```

## 梯形布局 clip-path

**图片需要绝对定位，clip-path才有效果**

两张等宽等高的图片，定位为绝对定位，第二张图片的left值为第一张图片宽度的一半。`clip-path`只是对图片进行剪裁显示，图片还是占据原来那么大的位置。

```javascript
<div class='fourth-right'>
    <img src="../backimg/page1.jpg">
    <img src="../backimg/page2.jpg">
</div>
```

```javascript
.fourth-right img {
    position: absolute;
}

.fourth-right>img:first-child:nth-last-child(2) {
    width: 66.66666667%;
    height: 100%;
    left: 0%;
    top: 0%;
    -webkit-clip-path: polygon(0% 0%, 100% 0%, 50% 100%, 0% 100%);
}

.fourth-right>img:first-child:nth-last-child(2)~img {
    width: 66.66666667%;
    height: 100%;
    left: 33.3333%;
    top: 0%;
    -webkit-clip-path: polygon(50% 0%, 100% 0%, 100% 100%, 0% 100%);
}
```

## 鼠标拖影效果

鼠标影子用的`span`标签，背景设置为雪花图片，行内块元素显示，fixed定位，**过渡时间为0.2秒**，经过多次实验这个值鼠标拖影最流畅，且不会粘到一起去。

**拖影效果三大重点：**

+ transition的设置

+ mousemove一次只移动一个雪花位置，不要移动一下，就把所有雪花位置向前移动，这样会黏在一起，没有拖影效果

+ 鼠标不移动时要把雪花归位到一起

具体实现过程：

一个值为6的计数器`count_move`
一个鼠标是否移动的标志位`move_flag`

拖影主要原理：后面的影子依次向前移动，也就是后面的影子等于前面的影子的坐标。

`body`上监听onmousemove，只要计数器的值大于0，当前计数器对应的影子坐标改成它前一个影子的坐标。计数器的值等于0时，当前计数器对应的影子的坐标等于鼠标的坐标，同时计数器归为初始值5。总结下来就是，检测到6次mousemove，这六个拖影的坐标才整体向前移动一次。**实质上就是拉长mousemove直接的间距，不让拖影移动太快，以免粘起来。**视觉上这五次移动的最终结果是一样的。

获取鼠标当前的坐标值：

因为采用了fixed定位，因此定位始终是相对于可是区窗口，因此获取鼠标当前值只用`clientX`和`clientY`就可以。

`clientX`和`clientY`是相对于浏览器窗口的位置，`pageX`和`pageY`是相对于`document`的定位。

鼠标移动`mouse_flag`为`false`，一旦本次移动结束后，设置为`true`，页面上添加了一个10ms的重复定时器来监听鼠标鼠标是否移动。当不移动时，把拖影重合，与第一个雪花位置重合。进行五次循环，每次都整体向前移动一位。

```javascript
var test_mouse = setInterval(function() {
                if (!move_flag) {
                    //令后一个等于前一个位置 最多循环五次可以使得所有雪花与第一个位置相同
                    for (var k = 0; k < mouse.length - 1; k++) {
                        for (var j = mouse.length - 1; j > 0; j--) {
                            mouse[j].style.left = mouse[j - 1].offsetLeft + 'px';
                            mouse[j].style.top = mouse[j - 1].offsetTop + 'px';
                        }
                    }
                }
            }, 10);
```

## 自适应轮播

轮播原理：不断改变ul的值为index*width，如果到了最后一张图片则index=0。其中图片的移动用的是`transition`。`ul`的`left`值要用index*width形式而不是用累加，这样可以和小圆点编号相关联，同时也使得自适应时`left`的值更改更容易。

布局：一个`ul`要固定长度以防li浮动换行，定位为绝对定位，父级元素为`relative`定位，`list-style:none;`消除小圆点，`height:100%`；内部`li`为`float=left`，height为百分百；外层显示窗口`overflow=hidden`;小圆点用`a`标签实现，设置圆角。


函数`Banner.start`，传入盒子，ul，按钮盒子。设置li的长为box的长，设置ul的宽为图片数目长度乘以box的长。有小圆纽，设置它的index属性，这样ul的left值就可以和小圆钮关联起来。

+ 自动轮播

设置定时器改变ul的位置，利用setTimeout来模拟setInterval，目标位置为-盒子宽度乘以index，index初始值为0，只要index的值小于图片数目-1，那么index就加上1，而target=index*width；如果index值大于imgnum-1，则说明到了最后一张图片，则target=0，index=0；设置ul的left值为-target，同时设置对应的btn的背景色为`grey`。不断调用当前函数。每次setTimeout函数之前都要把小圆钮的样式置空。

+ 按小圆钮

给每个小圆钮添加index属性，点击哪个，ul的left值就为-this.index*width，同时更改对应小圆钮的背景色

+ 自适应轮播

当页面改变大小时，首先会更改album的大小，重新设置album的高度；然后会重新设置li和img的大小，**ul的宽度也要重新设置，并把ul的left值改为当前index值与当前盒子宽度的乘积。**

**offsetLeft和offsetTop都是相对于父元素而言的**

**window.onresize的内容要写到一起，不然会重写，导致第一次写的无效；这里album类的高度要重新设置，轮播图的ul,li,img,left值也要重新设置，因此要写到一起**

## 鼠标移入相册封面特效

相册信息框是每个相册都有一个div，`<div class='des_div'>`，设置初始高度为0，但是div内有字时，尽管设置高度为0，也会显示出字；设置div的定位为绝对定位，距离底部-6px；`transition`为0.2s来显示向上动画。

在`img`和`div`上添加`onmouseover`事件，鼠标移入，对应`img`标签设置边框，对应`div`设置高度为100px；鼠标移出时`onmouseout`设置对应`div`的高度为0，`img`的边框为0。要将图片和描述`div`对应上，给每个图片添加index属性，在描述`div`数组中设置对应的css特性。

遇到的问题：

只给img添加鼠标移入移出事件时，在从img移动到div上时会发生div上下抖动现象。在给`div`和`img`都添加了鼠标移入移出事件后，就不会有这个抖动问题了。

## 回到顶部按钮

一个`div`里面添加了`img`标签

+ 回到顶部功能

`window.scrollBy(x,y)`和`setTimeout()`完成，最大滚动速度为100px，注意不足100px时的速度处理。

当点击按钮时，获取当前页面的滚动距离，兼容写法：`document.documentElement.scrollTop || document.body.scrollTop`；利用定时器setTimeout来完成运动效果，只要滚动距离大于0，就继续开启相同定时器。

`window.screenBy(x px,y px)`位移的距离，其中向右和向下为正，向左和向上为负。

`window.screenTo(x,y)`直接滚到（x,y）坐标处。

在这里用的是`screenBy`，每次滚动的最大位移是100，当页面滚动距离不足100时，就把速度改成当前页面滚动距离

` var speed = scrollTop > 100 ? 100 : scrollTop; window.scrollBy(0, -speed);`

+ 在滚动距离大于特定位置时，按钮才显示

`body`上监听`onscroll`事件，当滚动距离大于50px时，按钮显示，否则按钮`display:none`;

## 打字特效

**布局：**一个`typeBox`用于定位，里面`span`标签内容为要显示的字。`span`标签的文字居中显示`text-align:center`。

**实现原理：**利用定时器，不断向span标签中添加文字，当字符串都添加完时，清空span内容，再重新添加。

定义一个变量`s`存储要显示的所有内容，定义`str`变量，存储向`span`中要显示的文字，定义一个计数器`index`，调用字符串的`charAt(index)`方法。

定义一个`start`函数，在其中把`span`标签的内容清空，`str`清空，定义一个定时器`setInterval`，`str`的值为上次`str`的值加上`str.charAt(index)`的值，把`span`的`innerText`值改为`str`，然后`index++`，如此进行下去，当`index`值为`s.length+1`时，清除定时器，`index`归0，暂停2秒钟后再次调用`start()`函数

## 幽灵按钮

**布局：**一个按钮盒子里面包了三个按钮，每个按钮的布局：

```javascript
			<div class='link link-more'>
                <span class='icon'></span>
                <a href="javascript:;" class='button'>More
                    <span class='line line-top'></span>
                    <span class='line line-bottom'></span>
                    <span class='line line-left'></span>
                    <span class='line line-right'></span>
                </a>
            </div>
```

**实现原理：**`span`行内元素，要设置成块级元素给宽高才有效果。水平线：改变`width`和`left`值就可以；垂直线：改变`height`和`top`值就可以。

+ `.link`行内块显示，定位为绝对定位，不同按钮设置不同left值；

+ `.icon`设置为块显示，width和height用百分比显示，相对定位，不同按钮设置不同背景，hover时，2d转换效果，` transform: rotate(360deg) scale(1.2);transition: transform 0.2s linear;`；

+ `.button`设置背景为箭头，并给背景定位，hover时，改变背景图片的位置来达到箭头移动效果`background-postion:140px center`；设置宽度和高度为固定px值，给border设置了固定2px值，这样就不能自适应了；

+ `.line`设置为绝对定位，块元素显示，没给宽高时，显示不出来`transition：0.4s ease`以左侧水平线为例：

```javascript
.button .line-top {
    height: 2px;
    width: 0px;
    left: -110%;
    top: -2px;
}

.button:hover .line-top {
    width: 100%;
    left: -2px;
}
```

水平线更改线的宽度和left值就可以；宽度从0到盒宽。**注意起始时top为-2px，定位是除去border位置开始的。**


# 总结

+ 要声明文档模式`<!doctype html>`，这样才能准确获得窗口大小，页面大小

+ 动画效果现在都用的css3的过渡实现`transition`

+ 能用setTimeout来模拟setInterval就尽量用，在这里我有两处没用，因为那么做的时候有问题，没找到。注意递归调用时用arguments.callee，尽量不要用函数名直接调用。

+ 鼠标拖影效果做了一天才实现想要的这种效果，因为总会粘一起，onmousemove事件发生太频繁，就把五次移动整合为一次移动，五次才让鼠标影子整体向前移动一位，同时也要注意鼠标停下时，要让影子归位，不能直接停住不动了

+ `window.screenBy(x,y)`

+ 自适应轮播时，不仅要该图片，li大小，也要重新设置ul的长度，同时重新设置ul的left值

+ 两个东西关联起来时，添加属性index就可以

+ localStorage.setItem(name,value)

+ 事件委托

+ 定位是对于盒模型除去border部分开始的

+ IE盒模型

+ cursor:url(),pointer  备用的鼠标形式一定要写上

----

2016.8.11

# 木桶布局和瀑布流布局的实现

这篇涉及到的文件有：waterfall.html barrel.html waterfall_new.js barrel.js waterfall.css barrel.css mask.css aside.js mask.js aside.css 
# 1.木桶布局

### 布局特点

+ 每行宽度相同，为屏幕宽度

+ 每张图片的比例与原图相同

+ 每行高度近似

+ 每行图片数不同

### 木桶思想：

+ html和css部分

行内的图片是float:left布局，因此要给行设置宽度，否则浮动元素超出父元素宽度时会自动换行，因此这里把父元素（行）设置为可视区宽度，且不自适应。图片间距设置imgBox的padding，设置imgRow的marginBottom，设置rowContainer的padding

布局：

```javascript

.rowContainer(外层容器)>.imgRow(每一行)>.imgBox(图片盒子)>img(图片)
								                       >.showBox(图片信息盒子)

```

+ js部分

先依据给定的最小行高，以及图片自身比例，计算出图片缩小后的宽度，以此来确定一行的图片数目，由于一行图片的宽度和与最小行高的比值与屏幕宽度和行高的比值是相同的，因此计算出与屏幕宽度相匹配的新行高，将一行图片的在图片数组中的**起始位置和结束位置以及新行高**作为一个对象存起来，同时。接下来就是渲染了，依照行对象数组，依次生成行、图片，就可以完成木桶布局。

### 整个流程

+ 如果localStorage中没有albumTag，则设置为'测试相册'

+ ajax GET请求，到/api/getImg去拿图片信息数组，返回数组第一位是下一次图片起始坐标（尽管这里没用，因为会重新设置），同步，发送start:1，tag:localStorage["albumTag"]

+ 成功拿到图片信息数组后就是木桶布局的渲染

+ 监听页面滚动

+ 每一张图片监听mousemove事件

+ 异步加载图片，异步，接口相同，发送信息：start:Number(Barrel.prototype.nextIndex)，tag:localStorage['albumTag']

### 出现的问题及解决办法 一些设计解释

+ 由于要把图片按比例缩小，因此要获取图片的比例，但是`naturalWidth`在图片没有加载出来之前时是获取不到的，因此采用了图片的`img.onload`事件，为每个图片添加了`onload`事件，并设置一个计数器，每个图片加载完成，就把图片的信息（index,tag,name,src,ratio）添加到数组中，直到所有图片加载完成，组成一个新的图片数组（这个数组与传进来的图片数组顺序可能不同，因为每张图片加载速度的不同，所以入数组的顺序会与接收到的图片数组信息不同），此时再进行接下来的木桶布局的两个步骤。在每张图片加载过程中，可以设置进度条的`value=count/num`。在网上查资料时，说浏览器会缓存图片信息，缓存后就不会再触发图片的onload事件，`但是我实测发现，尽管浏览器缓存了图片，onload事件依然是会触发的`。
在node.js学习中发现这种计数器方法是解决多异步编程的一种方法，这个计数器叫做哨兵变量，在每个异步函数中都判断这个count值是否满足要求，满足时再进行接下来的同步操作。

+ 木桶布局当图片数目不够一行的时候是不会现实的，因此要把本次加载完成的图片的最后一个index加一作为下一次图片开始的头。但是有一个问题由于最终的图片顺序是打乱的，所以我只能找到之前加载过的图片最大index，以此作为下一次开始的index+1，但是这样还是避免不了中间有图片没机会展示，这个可以在图片加载出来之后按照index顺序进行排序来解决，现在没有这么做。

+ 由于我的展示是异步加载的，整个布局的最外层大容器是只生成一次就可以的，因此我把createBox单独写了出来

+ 页面第一次加载时同步加载的，避免用户在这期间做一些别的事情

+ 滚动滚轮异步加载时时异步加载的，这是可以继续放大点击查看图片，但是为了防止本次图片还没加载完，鼠标滚轮又滚动到底部异步加载，因此给了两个标志位来解决：`Barrel.prototype.imgLoad`是用来判断本次图片加载和布局是否完成，`flag`滚动距离和可视区高度是否大于**木桶布局盒子的高度-10**。当着两项都满足时，马上设置`Barrel.prototype.imgLoad`为`false`然后进行ajax异步加载图片、渲染。**注意滚动异步加载时不时滚动到屏幕底部，而是滚动到当前文档的底部。**

+ 鼠标移入显示图片信息提示框。这个做的不是很好，我是在每生成一个img时生成了一个div信息框，然后设置div内容为img的信息。设置div的定位为absolute，宽度百分百，高度为0（因为有内容，高度为0内容也会显示），bottom为0，完全透明，为每个图片添加了鼠标移入事件，移入时高度变为50px，透明度为0.6，鼠标移除时在变回初始值。把图片和提示框对应上又用到老办法，给每个图片添加index信息，这样就可以在div数组用相应的img.index找到对应的div。


### 核心代码

```javascript
	var start=0;
	var end=0;
	var rowWidth=0;
	var screenWidth=document.documentElement.clientWidth;
	var rowHeight=0;
	var rowArr=[];
	var width=0;
	var height=minHeight;

	for(var i=0;i<imgSrc.length;i++){
		width=height*imgSrc[i].ratio;
		rowWidth=rowWidth+width;
		if(rowWidth>screenWidth){
			rowWidth=rowWidth-imgSrc[i].naturalWidth;
			rowHeight=minHeight*screenWidth/rowWidth;
			end=i-1;
			rowArr.push({"rowHeight":rowHeight,"end":end,"start":start});
			start=i;
			rowWidth=width;
		}
	}

	for(var j=0;j<rowArr.length;j++){
		var row=document.createElement('div');
		row.style.height=rowArr[j].rowHeight+'px';
		row.style.width=screenWidth+'px';
			for(var k=rowArr[j].start;k<=rowArr[j].end;k++){
				var oImg=document.createElement('img');
				oImg.src=imgSrc[k].src;
				oImg.style.height=rowArr[j].rowHeight+'px';
				row.appendChild(oImg);
			}
		body.appendChild(row);
	}

```

### 各个函数功能

构造函数接受三个参数：最小行高 图片数组 图片间距

barrel.js中一共有三个原型上的函数，两个个原型属性

+ `Barrel.prototype.create`用于创建加载完成的图片数组，只有`create`函数执行完成后才能执行渲染函数`render`

+ `Barrel.prototype.createBox`用于创建外层容器 只在第一次加载页面时才执行

+ `Barrel.prototype.render`用于确定每一行的图片数目，每一行的新行高，以及木桶布局的渲染。

+ `Barrel.prototype.imgLoad`

+ `Barrel.prototype.nextIndex`

# 2.瀑布流布局

### 瀑布流布局特点

+ 每列的宽度相同

+ 图片比例和原图相同

### 瀑布流布局思想

+ html css部分

```javascript

.img-container(外层容器)>.boxContainer(列)>.img-box(图片盒子)>.imgContent(图片)
														    >.imgInfo(图片描述盒子)
														    	>.imgTag(相册信息)
			 											    	>.imgName(图片描述)
									 
```									 

外层容器.img-container依照媒体查询改变大小，列.boxContainer左浮动float:left，按照百分比显示宽度，这样可以达到宽度自适应，没有做高度自适应；图片.imgContent块级显示，鼠标移入时改变图片透明度。img宽度是100%显示，块级显示
**元素没有添加到DOM树中是获取不到高度的**

+ js部分(假设4列)

1. 创建外层容器 .img-container

2. 依照输入的列数目，平分外层容器，并以百分比表示；创建对应的列.boxContainer；把列添加到外层容器中，把外层容器添加到body中。

3. 创建图片盒子，把内容添加到盒子中，前4张图片顺次放到各个列中。再接下来的图片，先读取当前四列的高度，将下一张图片放到当前列高最小的那一列中，然后更新列高，再放下一张图片。瀑布流布局会使用完所有图片，所以下一个图片的坐标不需要重新指定，就用后台返回的就可以。

### 整体流程

+ 读取localStorage中的相册信息，若没有则设置成'测试相册'

+ ajax同步从后台读取图片信息。

+ 依据读到的图片信息数组，创建加载完成的图片数组。

+ 创建外层容器和列（只在第一次时需要）

+ 瀑布流布局

+ 监听鼠标滚动事件，滚动到文档底部异步加载，瀑布流布局（此时注意前四张图片的处理与一开始不一样）

### 出现的问题及解决办法 一些设计解释

+ 列只创建一次

+ 异步加载第二次图片时，不会再向第一次一样顺次放置图片

+ 由于图片数组是预加载后的，图片顺序可能不按照index顺序进行排列，所以没有用图片index值来判别是否当前列为空，而是用当前页面中的img数目，当img数目小于列数目时，就直接放入对应列。（只有相册是img）

+ 相册图片盒子宽度为100/col+‘%’，相册图片宽度100%显示，但是图片要给高度，否则块级显示的图片是没有高度的，因此图片数组中要有图片的原始宽高比。

+ 由于异步加载图片时，每次都生成一个新的实例，但是要继续接着上一次的colHeight来进行布局，所以colHeight应该一直都能访问到，所以定义在了原型上，使得每个实例都能访问到。

+ 图片预加载的过程与木桶布局一样，所以这里不再重述，每个图片对象包含四项内容：name,tag,src,ratio

+ 把图片添加到容器中以后，要记得更新列高数组。

+ 找到列高数组中的最小值的方法Math.min.call(Math,arr)；找到一个值在数组中的位置arr.indexOf(value);

+ 鼠标滚动异步加载图片的过程与木桶布局一致，再考虑当前是否滚动满足条件时也要考虑本次图片加载以及渲染是否完成。


### 核心代码

```javascript

//创建容器 创建列
Waterfall.prototype.createCol=function(){
	var imgContainer=creEle('div');
	for(var i=0;i<this.col;i++){
		var boxContainer=creEle('div');
		boxContainer=100/this.col+'%';
		imgContainer.appendChild(boxContainer);
	}
	body.appendChild(imgContainer);
}
//布局
Waterfall.prototype.render=function(){
	var colHeight=[];
	for(var i=0;i<img_arr.length;i++){
		var imgBox=creEle('div');
		var oImg=creEle('img');
		oImg.src=img_arr[i].src;
		var imgInfo=creEle('div');
		var imgName=creEle('div');
		var imgTag=creEle('div');
		imgInfo.appendChild(imgName);
		imgInfo.appendChild(imgTag);
		imgBox.appendChild(oImg);
		imgBox.appendChild(imgInfo);
		var showNum=document.getElementByTagName('img');
		if(showNum<=this.col){
			boxContainer[i].appendChild(imgBox);
			oImg.style.height=imgContent.offsetHeight/img_arr[i].ratio+'px';
			colHeight[i]=boxContainer.offsetHeight;
		}
		else{
			var minIndex=colHeight.indexOf(Math.min.call(Math,colHeight));
			oImg.style.height=oImg.offsetWidth/img_arr[i].ratio+'px';
			boxContainer[minIndex].appendChild(imgBox);
			colHeight[minIndex]=boxContainer[minIndex].offsetHeight;
		}
	}
	Waterfall.prototype.colHeight=colHeight;
}

```

### 各个函数功能

构造函数Waterfall，接收三个参数（列数目，间距，图片数组）

原型上定义了三个方法两个属性

+ `Waterfall.prototype.colHeight=[]`;列高数组

+ `Waterfall.prototype.create`创建图片数组，预加载和加载进度条

+ `Waterfall.prototype.createCol`创建列和创建最外层容器

+ `Waterfall.prototype.render`瀑布流布局

+ `Waterfall.prototype.imgLoad`指示当前布局是否完成

----
2016-8-13
---
title: ajax总结 跨域问题(JSONP postmessage)
tag: 项目总结
---

这篇主要写一下ajax。

ajax:无需刷新页面就能从服务器获得数据。核心是XHR对象

+ xhr.js

+ 跨域问题的解决(以前写过)

# 1.ajax过程

+ 声明一个XHR对象 var xhr=new XMLRequest();

+ xhr.open('GET'/'POST',url,true/false);启动一个请求以备发送，并不会真正发送请求。第一个参数为请求方式，第二个参数为请求url（GET方法时要把请求参数拼写到url后面），第三个参数为异步或是同步，true为异步，false为同步

+ xhr.send(null/数据主体)，当没有数据作为请求主体时必须写null，'GET'方法时就要写null，而'POST'方法就要写成数据主体

+ 监测xhr.readyState值和xhr.status值，为了保证兼容性，要在open之前监测这两个值。

### XHR对象的readyState属性，该属性表示当前请求/相应的阶段

+ 0：还未open()

+ 1：已经open()，还未send（）

+ 2：已经send（），还未收到响应数据

+ 3：收到部分相应数据

+ 4：已经收到所有的响应数据了

可以检测onreadystatechange事件来监测当前的readyState是否为4

### XHR对象的响应数据相关属性

+ status:HTTP状态号。status>=200&&status<300||status==304(服务器资源未改变，可以直接用缓存资源)

+ statusText:状态号说明

+ responseText:服务器返回数据 

### 一个简单的ajax异步过程

```javascript
var xhr=new XHRHttpRequest();
xhr.onreadystatechange=function(){
	if(xhr.readyState==4){
	if(xhr.status>=200&&xhr.status<300||xhr.status==304){
			console.log(xhr.responseText);
		}else{
		alert('error');
		}
	}
}
```
### 自定义HTTP头部信息

xhr.setRequestHeader('myheader','myvalue');

要在open()之后，send()之前设置。一般不要设置浏览器默认的头信息，HTTP头部信息可以参考第一篇总结中的缓存部分。

### 获取HTTP头部信息

xhr.getRequestHeader('headerName');

xhr.getAllRequestHeader();获得所有头部信息

### GET请求

要把请求数据拼接到url地址中，请求参数以键值对的形式拼接到url中，例：http://album.crystalxue.com?name='test'&tag='img'，并且参数的名和值都要进行encodeURIComponent()进行编码。

写一个函数将参数拼接到url中。

+ 查看当前url中是否有'?'，如果则用'&'来连接，否则就用'?'来连接。能用三目运算符的就用三目运算符，不要总定义一个flag来判断，我总是喜欢定义一个变量来判断。

```javascript
function concat(url,name,value){
	url+=(url.indexOf('?')==-1?'?':'&');
	url+=encodeURIComponent(name)+'='+encodeURIComponent(value)';
	return url;
}
```

### POST请求

把数据作为主体传入xhr.send(data)中。

对于POST请求，xhr会将序列化后的XML DOM文档序列化后作为请求主体提交到服务器，也可以把任意字符串作为主体提交到服务器。但是服务器对POST请求提交的表单数据必须要解析出有效部分才能用。使用XHR来模仿表单提交：首先将Contect-Type:application/x-www-form-urlencoded，然后将表单数据序列化后再通过XHR对象发送到服务器。

简单说一下表单序列化：（将表单数据拼接成一个字符串，再由浏览器发送给服务器，表单序列化就是将表单数据拼接成字符串的过程）

+ 对表单字段的名字和值进行URL编码，使用'&'进行分隔

+ 不发送禁用表单字段

+ 只发送勾选的单选框和复选框

+ 不发送'button'按钮和'reset'按钮

+ 多选选择框中的每个选中的值单独一个条目

+ 在单击提交按钮提交表单的情况下，也会发送提交按钮

+ select元素的值，就是选中的option元素的value特性的值。

**但是XML2级标准出现后，不需要表单序列化了，有一个叫FormData的对象来把表单数据直接序列化成一个字符串，这样浏览器就可以直接发送到服务器了**

#### FormData对象

+ FormData的append接受两个参数：键和值，分别对应表单字段的name和对应的value

```javascript
var data=new FormData();
data.append('name','value');
```

+ FormData也可以直接把表单元素作为参数，在生成实例时传进去

```javascript
var data=new FormData(document.forms[0]);//直接把整个表单传进去
```

+ 直接把FormData实例数据传入xhr.send()就可以，并且不用设置HTTP的Contect-Type

xhr.send(data);

### 超时设定

xhr对象上的一个timeout属性

```javascript
xhr.ontimeout=function(){}

xhr.timeout=1000;
```

### 进度事件

xhr.upload.onprogress事件是上传事件进度

xhr.onprogress事件是下载进度

在做上传进度条时，开始一直在用xhr.onprogress事件，一直都不对，把xhr对象打出来才发现。

+ event.lengthComputable 进度信息是否可用的布尔值

+ event.loaded 以接受字节数

+ event.total 预期字节数

xhr.onprogress=function(event){
	if(event.lengthComputable){
		var percent=event.loaded/event.total;
	}
}

xhr.upload.onprogress和xhr.onprogress事件中只有event.loaded(已完成)和event.total(总字节数)，并没有event.position，这一点与书上讲的不同。

此外在下载过程中，如果后台不回复Content-Length，前端的xhr.progress事件中，event.lengthComputable是为false的，且event.total=0;

### xhr对象的属性

+ xhr.onabort()在没收到响应之前暂停请求

+ xhr.onloadstart

+ xhr.onload

+ xhr.onloadend

+ xhr.onerror

+ xhr.onprogress

+ xhr.readyState

+ xhr.onreadystatechange

+ xhr.timeout

+ xhr.ontimeout

+ xhr.responseText

+ xhr.responseType

+ xhr.responseXML

+ xhr.responseURL

+ xhr.status

+ xhr.statusText

+ xhr.withCredentials

+ xhr.upload

+ xhr.upload.onabort

+ xhr.upload.onloadstart

+ xhr.upload.onload

+ xhr.upload.onloadend

+ xhr.upload.onerror

+ xhr.upload.onprogress

+ xhr.upload.ontimeout

### 我的项目中的ajax

参考了jQuery的ajax两种设计方式：

+ 内部返回————回调函数

+ 外部返回————链式调用，声明了一个deffered对象

当然我只会第一种，jQuery花了好大力气写出的deffered对象我还没有拜读，自然也是不会的。

回掉方式的调用示例：

```javascript
ajax({"method":"GET","sync":false,"url":"","data":{},"success":fn.success,"fail":fn.fail});
```

直接把函数作为参数传进去，就是回掉函数。

+ 设计

ajax接受一个对象，里面有方法(GET/POST)，是否异步，请求url，请求数据，请求成功的函数，请求失败的函数。对GET数据要进行处理拼接到url上；一个上传进度事件。

代码：

```javascript
var ajax=function(config){
	var method=config.method.toUpperCase();
	var sync=config.sync;
	var url=config.url;
	var data=config.data;
	var success=config.success;
	var fail=config.fail;
	var postData=null;
	var progress=config.progress;
	if(method=='GET'){
		if(data){
			for(var props in data){
				url+=(url.indexOf('?')==-1?"?":"&");
				url+=encodeURIComponent(props)+'='+encodeURIComponent(data[props]);
			}
		}		
		postData=null;		
	}
	if(method=='POST'){
		postData=data;
	}
	var xhr=new XMLHttpRequest();
	xhr.open(method,url,sync);
	xhr.onreadystatechange=function(){
		if(xhr.readyState==4){
			if(xhr.status>=200&&xhr.status<300||xhr.status==304){
				var response=JSON.parse(responseText);
				success(response);
			}
			else{
				var response=JSON.parse(resonseText);
				fail(response);
			}
		}

	}
	xhr.upload.onprogress=function(evt){
		if(evt.lengthComputabel){
			var percentComplete=evt.loaded/evt.total;
			progress(percentComplete);
		}
	}
	xhr.send(postData);	
}
```

# 2.ajax跨域问题

当前页面要请求的资源与当前页面的域名不一样的时候就会发生跨域行为，而导致拿不到资源。但是img标签和script标签是没有这个限制的，因此可以用来解决跨域问题

### script标签解决跨域问题——JSONP(把JSON包在函数中)

思想：就是动态创建一个script标签，标签的src属性就为要请求资源的另一个域，动态生成的script标签是异步加载的，另一个域会返回一个函数调用，而这个函数要在当前域写好

```javascript
<script>
	//回调函数的定义
	function box(json){
		console.log(json);
		//todo
	}
	function createJS(url){
		var oScript=document.createElement('script');
		oScript.src=url;
		oScript.type='text/javascript';
		var body=document.getElementsByTagName('body')[0];
		body.appendChild(oScript);
	}
	createJS('http://lnxiaoy.com');
	createJS('http://lnxiaoy.com?callback=box');//指定回调函数的名字
</script>

```

**注意的地方**

1. box()就是回调函数

2. 动态创建的script标签就是异步加载的，且在任务队列中，就算是加载完也不会立即执行，要等到当前页面中所有script内容加载完并执行完才会执行，这一点我不是很确定，只是目前实验结果为这样。

### HTML5的postmessage(跨文档消息传递XDM)解决跨域、跨窗口消息传递

window.postMessage的功能是允许程序员跨域在两个窗口/iframe间发送数据信息。与跨域的AJAX很像，但是AJAX是客户端和服务器之间通信，而postMessage是两个客户端之间的通信。

XDM跨文档消息传递，来自不同域的页面之间传递消息，情况如下：

+ 当前窗口和新窗口之间的数据传递

+ 多窗口之间的数据传递

+ 页面与嵌套iframe消息传递 iframe会创建包含另外一个文档的内联框架

+ 上面三个问题的跨域数据传递

### postMessage()发送消息

postMessage(data,origin)

+ data:要发送的数据，为了兼容浏览器，最好转化成字符串再发送，JSON.stringify()

+ origin:指定接受消息的窗口的域

本地

```javascript
<html>
<head>
	<meta charset='utf-8'>
	<title>postmessage测试</title>
</head>
<body>
	<div style="width:200px; float:left; margin-right:200px;border:solid 1px #333;">
        <div id="color">Frame Color</div>
    </div>
    <div>
        <iframe id="child" src="http://album.crystalxue.com/test.html" style='600px; height:400px;'></iframe>
    </div>
<script type="text/javascript">
	window.onload=function(){
            window.frames[0].postMessage('hello','http://album.crystalxue.com/test.html');//接受消息的frame上调用postMessage
        }
</script>
</body>
</html>
```

是由接受消息的frame调用postMessage()方法的

### 接受消息 window.onmessage/或用事件监听

message事件的事件对象有三个属性：

+ e.origin 发送消息的域

+ e.data 发送的信息

+ e.source window对象的代理

http://album.crystalxue.com/test.html

```javascript
<!doctype html>
<html>
<head>
	<meta charset='utf-8'>
	<title>postmessage测试 跨域测试</title>
</head>
<body>
<script type="text/javascript">
	window.addEventListener('message',function(e){
		console.log(window.parent);//window
		console.log(e.source,'source');//window
		console.log(e.data,'data');//hello
		console.log(e.origin,'origin');//http://localhost:3000
	},false);
</script>
</body>
</html>
```

### 向来自不同域的不同iframe窗口分别传递信息

向哪个窗口发信息，就由哪个iframe来调用postmessage

```javascript
<html>
<head>
    <meta charset='utf-8'>
    <title>postmessage测试</title>
</head>
<body>
    <div style="width:200px; float:left; margin-right:200px;border:solid 1px #333;">
        <div id="color">Frame Color</div>
    </div>
    <div>
        <iframe id="child1" src="http://album.crystalxue.com/test.html" style='600px; height:400px;'></iframe>
    </div>
    <div>
        <iframe id="child2" src="http://album.crystalxue.com/test.html" style='600px; height:400px;'></iframe>
    </div>
    <div>
        <iframe id="child3" src="http://album.crystalxue.com/test.html" style='600px; height:400px;'></iframe>
    </div>

<script type="text/javascript">
    window.onload=function(){
            //向不同iframe中传递不同信息
            window.frames[0].postMessage('hello','http://album.crystalxue.com/test.html');//接受消息的frame上调用postMessage
            window.frames[1].postMessage('1','http://album.crystalxue.com/test.html');
            window.frames[2].postMessage('2','http://album.crystalxue.com/test.html');
        }
</script>
</body>
</html>
```

### 向新窗口发送信息

**注意：**浏览器现在大多数屏蔽了弹出新窗口，因此这种在我浏览器中没有实验成功。

var newWindow=window.open(url,'窗口名','窗口参数设置','是否取代当前窗口的布尔值')

记住一句话：要往哪个窗口发信息就由哪个窗口调用postMessage，并在这个窗口内部监听message事件。

+ 发送消息

```javascript
var newWindow=window.open(url);
newWindow.postMessage(data,url);

```

其中window.open()会返回一个窗口引用，指向新窗口对象。

+ 接受消息

```javascript
window.addEventListener('message',function(ev){
	if(ev.origin!='发送源') return;
	console.log(ev.data);
	console.log(ev.origin);
},false);
```

通常都要检测来的消息是否为当前窗口可以接受的源，如果不是，则不处理数据，避免恶意数据。

### CORS跨源资源共享

通过自定义HTTP头部来告诉服务器当前页面的信息，服务器根据这个头部来决定这个请求是否可以接受。如果服务器认为请求可以接受就回复相同的源信息。但是这个会造成安全问题，阿里面试时是这么说的。

# 3.其他ajax技术

上面ajax是以XHR对象为基础实现的，下面说另外一种实现ajax的方法

### Comet(服务器推送技术)

不需要前端主动请求，而是服务器主动把最新内容推送到浏览器。这种技术非常适合于体育比分和股票行情。

**实现方式：**

+ 长轮询

+ http流

#### 长轮询

**过程：**

服务端和客户端建立连接后，服务端一直保持连接打开，客户端发起一个到服务端的请求，**服务端不立即应答，而是当有数据发送时才发送**。发送完数据后，客户端关闭本次连接，随即又发起一个新的请求。这一过程持续并不断。轮询是所有浏览器都支持。

#### 流

**过程**

流是整个过程都使用一个http连接。服务端一直保持连接打开，客户端向浏览器发送一个请求，服务端周期性向客户端发送数据。

**实现：**

使用XHR对象来实现，侦听readystatechange事件及监测readyState是否为3来实现。服务器向客户端发送数据，readyState会周期性的变为3，当变为3时，responseText中就会保存接受到的所有数据，此时要比较从什么位置开始接受数据。

```
function createStreaming(url,progress,finished){
	var xhr=new XMLHttpRequest();
	var received=0;//接受数据的长度计数器
	xhr.open('get',url,true);
	xhr.onreadystatechange=function(){
		var result;//接收到的数据
		if(xhr.readyState==3){
			result=xhr.responseText.substring(received);//取出本次的数据
			received=received+result.length;//更新数据长度
			progress(result);//对接受到的数据进行处理
		}else if(xhr.readyState==4){
			finished(xhr.responseText);//成功接收处理
		}
	}
	xhr.send(null);
	return xhr;
}
```

----
2016-8-13
---
title: 遮罩层 侧边固定按钮
tag: 项目总结
---

这篇要说的是瀑布流展示的时候点击图片会出现遮罩层显示放大图片，右侧有返回主页面和链接到上传页面的按钮。实现起来比较简单，一个用的是模块模式，一个用的是单例模式

# 1.遮罩层 mask.js mask.css

#### 实现样式和功能：

+ 点击图片时，遮罩层显示

+ 图片默认以原大小显示，且垂直水平居中显示，以高度最大不能超过屏幕高度来限制图片等比例最大size，图片会自适应屏幕大小。

+ 点击遮罩层黑色部分时，遮罩层消失。

#### 实现原理：

mask.js作为一个遮罩层库的形式，动态创建一个div.overMask，动态穿件一个img.showImg，把img添加到div中，再把div添加到body中，设置显示为none，在css中设置img为水平垂直居中。body上监听点击事件，当目标标签为img时（只有图片是img，其余部分没有img），读取target的src属性并把它赋值给img.showImg，并设置img的宽度和高度为图片的本身大小，如果高度超过屏幕，则高度设置为屏幕高度的80%（百分比的高度可以使得图片自适应）

#### 具体实现

##### css设置

+ .showImg

fixed定位，垂直居中显示

对于宽度不能确定的元素，当然定位不是static的，可以用left，top值和transform的translateX和translateY来进行垂直居中定位，这种方法很常用，我的项目里用了很多

例：对于一个宽度和高度都固定的元素，水平垂直居中定位

```javascript
.showImg{
	width:200px;
	height:300px;
	position:absolute;
	left:50%;
	top:50%;
	margin-left:-100px;
	margin-top:-150px;
}
```

例：对于一个宽度和高度都不固定的元素，水平垂直居中定位

```javascript
.showImg{
	position:fixed;
	left:50%;
	top:50%;
	transform:translateX(-50%) translateY(-50%);
}
```

可以用2D变换主要是因为位移translateX和translageY的百分数是相对于本身大小的，因此和设置margin的原理是相同的

+ .overMask

相对于浏览器窗口的位置不变，因此采用了相对于浏览器可视区的fixed定位，并设置left和top值为0，并设置z-index为10，使它浮在整个展示页面上方，定义宽度和高度为屏幕宽度和高度的100%

##### js部分

模块模式——为单例创建私有变量和特权方法（增强型的单例模式），返回共有方法和公有属性。模块模式用了一个返回对象的自执行匿名函数。

模块模式在需要对单例进行初始化，并要维护一些私有变量时非常有用。

**对于图片只要设置宽度和高度中的一个值，图片就会以对应比例的大小显示**

```javascript
var mask = function() {
    var doc = document;
    var body = document.getElementsByTagName('body')[0];
    var screenWidth = doc.documentElement.clientWidth;
    var screenHeight = doc.documentElement.clientHeight;
    var overMask = document.createElement('div');
    overMask.className = 'overMask';
    var showImg = document.createElement('img');
    showImg.className = 'showImg';
    overMask.appendChild(showImg);
    doc.body.appendChild(overMask);
    overMask.style.display = 'none';
    function show() {
        //点击事件
        body.removeEventListener('click', maskShow, false);
        body.addEventListener('click', maskShow, false);

        function maskShow(e) {
            // console.log(e.target.className,'e');
            if (e.target.nodeName.toLowerCase() == "img") {
                //获取图片
                var img = e.target;
                //设置图片标签的src属性
                showImg.src = img.src;
                //要限制图片的大小 不能超过屏幕大小
                var width = showImg.naturalWidth;
                var height = showImg.naturalHeight;
                // console.log(width,height);
                // console.log(screenHeight);
                //限制大小 不超过屏幕大小
                if (height >= screenHeight) {
                    // console.log('true');
                    showImg.style.height = 80 + "%"; //这样可以自适应
                    // console.log(showImg.offsetHeight);
                }

                overMask.style.display = 'block';
            }
            if (e.target == overMask) {
                overMask.style.display = 'none';
            }
        }
    }
    return {
        method1: show
    };
}();
```

# 2. 侧边栏按钮

aside.js aisde.css

单例模式（只有一个实例的对象，以对象字面量的形式创建的）

### 实现原理

+ 单例模式，使得任何页面都能用（我这里是在progress之前添加元素了，应该写成在body中直接添加，这样拓展性好）

+ a标签显示成按钮，block显示，fixed定位，z-index为10，在页面之上。

+ 动态生成的按钮

### 代码

```javascript
var aside={
	asideBar:function(){
		var doc=document;
		var oProgress=doc.getElementsByTagName('progress')[0];
		var oLink1=document.createElement('a');
		console.log(oLink1);
		oLink1.innerHTML='上传图片';
		oLink1.className='oLink1';
		oLink1.href='../html/upload_new.html';
		var oLink2=document.createElement('a');
		oLink2.innerHTML='返回主页';
		oLink2.className='oLink2';
		oLink2.href='../html/index.html';
		document.body.insertBefore(oLink1,oProgress);
		document.body.insertBefore(oLink2,oLink1);
	}
}
```


