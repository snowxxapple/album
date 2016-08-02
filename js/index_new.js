//改变album高度的函数
var Album = (function() {
    return {
        init: function(height, obj) {
            var album = obj;
            album[0].style.height = height * 0.9 + 'px';
            album[1].style.height = height * 0.6 + 'px';
            album[2].style.height = height * 0.8 + 'px';
            album[3].style.height = height * 0.6 + 'px';
            album[4].style.height = height * 0.6 + 'px';
            album[5].style.height = height * 0.5 + 'px';
        }
    }
})();
//轮播
var Banner = (function() {
    return {
        start: function(box, oUl, btn_box) {
            var oLi = oUl.getElementsByTagName('li');
            var imgNum = oLi.length;
            var btn_arr = btn_box.getElementsByTagName('a');
            var timer;
            var timer1;
            var box_width;
            var oImg = oUl.getElementsByClassName('banner_img');
            box_width = box.offsetWidth;
            //li设置长度
            for (var i = 0; i < imgNum; i++) {
                oLi[i].style.width = box_width + 'px';
                oImg[i].style.width = box_width + 'px';
            }
            //设置ul的宽度，否则li不会一列排开
            oUl.style.width = box_width * imgNum + 'px';

            var target = 0;
            var index = 0;
            btn_arr[0].style.background='grey';
            //
            window.onresize = function() {
                var doc = document;
                var height = doc.documentElement.clientHeight;
                var obj = document.getElementsByClassName('album');
                Album.init(height, obj);

                for (var i = 0; i < imgNum; i++) {
                    oLi[i].style.width = box.offsetWidth + 'px';
                    oImg[i].style.width = box.offsetWidth + 'px';
                }
                //一定要更改当前ul的长度 也要更改当前ul的位置 因为整个div的大小变化，
                //直接更改li和img后，其实ul的大小也要变换，所以对应的left值也要改变，否则可视区的图片是不对的
                oUl.style.width = box.offsetWidth* imgNum + 'px';
                box_width=oImg[0].offsetWidth;
                oUl.style.left=-box_width*index+'px';
            }

            //改变ul的位置           
            setTimeout(function() {
                for (var i = 0; i < btn_arr.length; i++) {
                    btn_arr[i].style.background = 'white';
                }
                if (index<imgNum-1) {                    
                    index = index + 1;
                    target = box_width*index;
                } else {
                    target = 0;
                    index = 0;
                }
                oUl.style.left = -target + 'px';
                btn_arr[index].style.background = 'grey';
                setTimeout(arguments.callee, 3000);
            }, 3000);

            for (var j = 0; j < imgNum; j++) {
                var oBtn = btn_arr[j];
                oBtn.index = j;
                oBtn.onclick = function() {
                    for (var i = 0; i < btn_arr.length; i++) {
                        btn_arr[i].style.background = 'white';
                    }
                    index = this.index;
                    target = index * box_width;
                    oUl.style.left = -target + 'px';
                    btn_arr[index].style.background = 'grey';
                }
            }

        }
    }
})();
