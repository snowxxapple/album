# 项目总结--不断更新

# 相册主要功能及实现的简单介绍：

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


