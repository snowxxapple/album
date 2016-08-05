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
