var mask = function() {
    var doc = document;
    var body = document.getElementsByTagName('body')[0];
    var screenWidth = doc.body.clientWidth;
    var screenHeight = doc.body.clientHeight;
    var screenHeight;
    var overMask = document.createElement('div');
    overMask.className = 'overMask';
    var showImg = document.createElement('img');
    showImg.className = 'showImg';
    overMask.appendChild(showImg);
    doc.body.appendChild(overMask);
    // doc.body.appendChild(showImg);
    //设置display=none;
    overMask.style.display = 'none';
    // showImg.style.display='none';
    //不好的写法
    // function resize(){
    // 	screenWidth=doc.body.clientWidth;
    // 	screenHeight=doc.body.clientHeight;
    // 	overMask.style.width=screenWidth+'px';
    // 	overMask.style.height=screenHeight+'px';
    // 	showImg.style.left=screenWidth/2+'px';
    // 	showImg.style.top=screenHeight/2+'px';
    // }
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
                    // showImg.style.height=0.8*screenHeight+'px';//这样固定高度后就不能自适应了
                    showImg.style.height = 80 + "%"; //这样可以自适应
                    // console.log(showImg.offsetHeight);
                }

                overMask.style.display = 'block';
                // showImg.style.display='block';			
            }
            if (e.target == overMask) {
                overMask.style.display = 'none';
                // showImg.style.display='none';
            }
        }
    }

    function changeOpa() {
        body.addEventListener('mouseover', change, false);
        body.addEventListener('mouseout',origin,false);
        function change(ev) {
            if (overMask.style.display == 'none') {
                if (ev.target.nodeName.toLowerCase() == 'img') {
                    var oImg = ev.target;
                    oImg.style.opacity = 0.5;
                }
            }
        }
        function origin(ev){
        	if(ev.target.nodeName.toLowerCase()=='img'){
        		var oImg=ev.target;
        		// console.log(oImg);//是离开的那个图片
        		oImg.style.opacity=1;
        	}
        }
    }
    return {
        method1: show,
        method2: changeOpa
    };
}();
