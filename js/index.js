//改变album高度的函数
var Album = (function() {
    return {
        init: function(height, obj) {
            var album = obj;
            album[0].style.height = height * 0.8 + 'px';
            album[1].style.height = height * 0.6 + 'px';
            album[2].style.height = height * 0.8 + 'px';
            album[3].style.height = height * 0.6 + 'px';
            album[4].style.height = height * 0.6 + 'px';
            album[5].style.height = height * 0.5 + 'px';
            window.onresize = function() {
                var doc = document;
                var height = doc.documentElement.clientHeight;
                var obj = document.getElementsByClassName('album');
                Album.init(height, obj);
            }
        }
    }
})();
//轮播
var Banner = (function() {

    return {
        start: function(box_width, oUl, btn_box) {
            var oLi = oUl.getElementsByTagName('li');
            var imgNum = oLi.length;
            var btn_arr = btn_box.getElementsByTagName('a');
            var timer;
            var timer1;
            //生成小圆点
            for (var i = 0; i < imgNum; i++) {
                var btn = document.createElement('a');
                btn.href = 'javascript:;';
                btn_box.appendChild(btn);
                oLi[i].style.width = box_width + 'px';
            }
            //设置ul的宽度，否则li不会一列排开
            oUl.style.width = box_width * imgNum + 'px';
            //给小圆点定位
            btn_box.style.left = box_width / 2 + 'px';
            btn_box.style.bottom = 10 + 'px';
            var target = 0;
            var index = 0;
            btn_arr[index].style.background = 'grey';
            //改变ul的位置
            change();
            function change() {
                timer = setTimeout(function() {
                    for (var i = 0; i < btn_arr.length; i++) {
                        btn_arr[i].style.background = 'white';
                    }
                    if (target < box_width * (imgNum - 1)) {
                        target = target + box_width;
                        index = index + 1;
                    } else {
                        target = 0;
                        index = 0;
                    }
                    move(oUl, -target);
                    // oUl.style.left = -target + 'px';
                    btn_arr[index].style.background = 'grey';
                    timer = setTimeout(arguments.callee, 6000);
                }, 6000);
            }


            function move(oUl, target) {
                //缓冲运动 用css的transition有问题 第一张图片移走时没有动画效果
                timer1 = setTimeout(function() {
                    var position = oUl.offsetLeft;
                    if (position != target) {
                        var speed = (target - position) / 10;
                        //speed>0向右移动 speed<0向左移动 要保持最小移动单位为1像素
                        var speed_new = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
                        oUl.style.left = position + speed_new + 'px';
                        timer1 = setTimeout(arguments.callee, 10);
                    }

                }, 10);

            }
            for (var j = 0; j < imgNum; j++) {
                var oBtn = btn_arr[j];
                oBtn.index = j;
                oBtn.onclick = function() {
                    //点击的时候就停掉定时器以免闪烁
                    clearTimeout(timer);
                    clearTimeout(timer1);
                    for (var i = 0; i < btn_arr.length; i++) {
                        btn_arr[i].style.background = 'white';
                    }
                    index = this.index;
                    target = index * box_width;
                    move(oUl, -target);
                    btn_arr[index].style.background = 'grey';
                    change();
                }
            }
        }
    }
})();
