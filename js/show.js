var modle = (function() { //私有作用域  单例模式
    //添加按钮
    //定义私有变量
    var oUl = document.getElementsByTagName('ul')[0];
    var oBtn1 = document.createElement('span');
    var oBtn2 = document.createElement('span');
    var oImg1 = document.createElement('img');
    var oImg2 = document.createElement('img');
    oImg1.src = '/js/img/left.png'; //路径都是相对于开服务器的路径index.js而言的
    oImg2.src = '/js/img/right.png';
    oImg1.className = 'img';
    oImg2.className = 'img';
    oBtn1.className = 'btn';
    oBtn2.className = 'btn';
    var arr = []; //存图片的各项属性
    var oLi = document.getElementsByTagName('li');
    var number;
    //公有方法 可以访问私有变量
    // function getStyle(obj,attr){
    // 	if(obj.currentStyle){
    // 		return obj.currentStyle[attr];
    // 	}
    // 	else{
    // 		return getComputedStyle(obj,false)[attr];
    // 	}
    // }
    function show(num, showWidth, showHeight, singleWidth) {
        //num是要显示的个数 showWidth是插件宽度  showHeight是插件高度
        //定义插件的宽高
        number=num;
        var outBox = document.getElementsByTagName('ul')[0];
        outBox.style.width = showWidth + 'px';
        outBox.style.height = showHeight + 'px';
        //先布局
        var middleIndex = Math.floor(num / 2); // 找到中间照片的位置
        (function() {
            for (var k = 0; k < oLi.length; k++) {
                oLi[k].style.width = singleWidth + 'px';
            }
        })();
        //中间盒子照片定位  水平居中
        var middle = oLi[middleIndex];
        middle.style.height = showHeight + 'px';
        middle.style.left = 0.5 * outBox.offsetWidth - 0.5 * singleWidth + 'px';

        oBtn1.style.left = middle.offsetLeft + 'px';
        oBtn2.style.left = middle.offsetLeft + singleWidth - 60 + 'px';
        oBtn1.style.top = middle.offsetTop + middle.offsetHeight * 0.5 - 20 + 'px';
        oBtn2.style.top = middle.offsetTop + middle.offsetHeight * 0.5 - 20 + 'px';
        oUl.appendChild(oBtn1);
        oUl.appendChild(oBtn2);
        oBtn1.appendChild(oImg1);
        oBtn2.appendChild(oImg2);
        //布局
        var long = (outBox.offsetWidth - singleWidth) * 0.5; //剩余                            的可以排列图片的地方
        var speedX = long / middleIndex;
        var speedY = (outBox.offsetHeight - 200) * 0.5 / middleIndex; //图片最矮为200px

        (function() {
            var moveX = speedX;
            var moveY = speedY;
            var index = 0;
            for (var i = middleIndex - 1; i >= 0; i--) {
                oLi[i].style.left = middle.offsetLeft - moveX + 'px';
                oLi[i].style.height = middle.offsetHeight - moveY * 2 + 'px';
                oLi[i].style.top = middle.offsetTop + moveY + 'px';
                index = index - 1;
                oLi[i].style.zIndex = index;
                oLi[i].style.opacity = (i + 1) * 0.26;
                moveX = moveX + speedX;
                moveY = moveY + speedY;
            }
        })();

        (function() {
            var moveX = speedX;
            var moveY = speedY;
            var index = 0;
            for (var i = middleIndex + 1; i < num; i++) {
                oLi[i].style.left = middle.offsetLeft + moveX + 'px';
                oLi[i].style.height = middle.offsetHeight - moveY * 2 + 'px';
                oLi[i].style.top = middle.offsetTop + moveY + 'px';
                index = index - 1;
                oLi[i].style.zIndex = index;
                oLi[i].style.opacity = (num - i) * 0.26;
                moveX = moveX + speedX;
                moveY = moveY + speedY;
            }
        })();
        //图片轮播效果
        //对于非行间样式 用style不能获得？opacity在单独写的时候可以获取到，但是在这里用函数获取不到，而用的是style.opacity
        (function() {
            for (var i = 0; i < num; i++) {
                // arr.push([oLi[i].offsetLeft,oLi[i].offsetTop,getStyle(oLi[i],'zIndex'),getStyle(oLi[i],'opacity'),oLi[i].offsetHeight]);
                // console.log(getStyle(oLi[i],'opacity'),'opacity');//用js设置的style属性,用obj.style.attr是都可以获取得到的,getStyle获取的是写在CSS样式中的,所以这里根本就不需要
                // console.log(oLi[i].style.opacity);
                // console.log(oLi[i].style.zIndex,'zIndex');
                // console.log(getComputedStyle(oLi[i],false)['opacity']);
                arr.push([oLi[i].offsetLeft, oLi[i].offsetTop, oLi[i].style.zIndex, oLi[i].style.opacity, oLi[i].offsetHeight]);

            }
        })();
        oBtn1.onclick = function() {
            //左移 1号上是末尾的坐标,2号上是1号的坐标,3号是2号的坐标,重新得到的数组赋给图片
            arr.unshift(arr[arr.length - 1]);
            arr.pop();
            for (var i = 0; i < num; i++) {
                oLi[i].style.left = arr[i][0] + 'px';
                oLi[i].style.top = arr[i][1] + 'px';
                oLi[i].style.zIndex = arr[i][2];
                oLi[i].style.opacity = arr[i][3];
                oLi[i].style.height = arr[i][4] + 'px';
            }
        }
        oBtn2.onclick = function() {
            //右移 1号上是2的坐标 2号上是3号的坐标...以此类推,所以是第一个元素查到队尾,删除一号,得到新数组,将新数组重新赋值给图片		
            arr.push(arr[0]);
            arr.shift();
            for (var i = 0; i < num; i++) {
                oLi[i].style.left = arr[i][0] + 'px';
                oLi[i].style.top = arr[i][1] + 'px';
                oLi[i].style.zIndex = arr[i][2];
                oLi[i].style.opacity = arr[i][3];
                oLi[i].style.height = arr[i][4] + 'px';
            }
        }
        console.log(arr);
    }

    function autoMove() {
        //自动右移
        if (arr.length == number) {
            setTimeout(move, 5000);
            function move() {
                arr.push(arr[0]);
                arr.shift();
                for (var i = 0; i < number; i++) {
                    oLi[i].style.left = arr[i][0] + 'px';
                    oLi[i].style.top = arr[i][1] + 'px';
                    oLi[i].style.zIndex = arr[i][2];
                    oLi[i].style.opacity = arr[i][3];
                    oLi[i].style.height = arr[i][4] + 'px';
                }
                setTimeout(arguments.callee,5000);
            }
        }

    }
    //返回公有方法 用对象字面量的方式创建的返回对象,因此每个单例都是Object的实例
    return { //返回的对象字面量 只有一个可以公开的方法
        // method1:getStyle,
        method: show,
        auto: autoMove
    };
})();
