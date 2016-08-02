//要实现布局的图片可以传入图片的src数组信息或者给一个baseUrl信息
//声明创建元素的函数
function creEle(tag) {
    var doc = document;
    return doc.createElement(tag);
}
//构造函数 Barrel
function Barrel(minHeight, img, space) {
    // console.log(img, 'img');
    this.minHeight = minHeight;
    this.space = space;
    this.imgNum = 40;
    this.imgArr = img;
}
//创建图片 创建图片数组 获取图片的比率
Barrel.prototype.create = function() {
        this.imgSrc = [];
        var count = 0;
        var that = this;
        var allNum = this.imgNum;
        var oProgress = document.getElementsByTagName('progress')[0];
        for (var i = 0; i < this.imgNum; i++) {
            var oImg = this.imgArr[i];
            var img = creEle('img');
            img.src = oImg.src;
            img.name = oImg.name;
            img.tag = oImg.tag;
            img.index = oImg.index;
            // startArr.push(oImg.index);
            img.onload = function() {
                var _this = this;
                count = count + 1;
                oProgress.style.display='block';
                oProgress.value=count/allNum;
                var width = this.naturalWidth;
                var height = this.naturalHeight;
                that.imgSrc.push({
                    ratio: width / height,
                    url: _this.src,
                    tag: _this.tag,
                    name: _this.name,
                    index: _this.index
                });
                if (count == allNum) {
                    count = 0;
                    oProgress.style.display='none';
                	oProgress.value=0;
                    // console.log(that.imgSrc);
                    //图片都加载完，开始渲染
                    that.render();
                    //加载完之后，将标志位设成true;
                    Barrel.prototype.imgLoad = true;
                }
            }


        }
    }
    //创建外层容器
Barrel.prototype.createBox = function() {
        var rowContainer = creEle('div'); //包括所有图片的外层容器  因为把box添加到这个容器中要在之后用，因此这个变量要在对象上建立
        rowContainer.className = 'rowContainer';
        var oProgress = document.getElementsByTagName('progress')[0];
        rowContainer.style.padding = this.space / 2 + 'px';
        rowContainer.style.paddingTop = this.space + 'px';
        document.body.insertBefore(rowContainer, oProgress);
        // document.body.appendChild(rowContainer);
    }
    //页面布局
Barrel.prototype.render = function() {
    var rowStart = 0;
    var rowEnd = 0;
    var rowWidth = 0;
    var rows = [];
    var rowContainer = document.getElementsByClassName('rowContainer')[0];
    // console.log(rowContainer.offsetWidth, 'rowContainer');
    //确定行数
    for (var i = 0; i < this.imgSrc.length; i++) {
        //要按照新的比例更新图片的长和宽,其实就是按比例缩小图片
        this.imgSrc[i].height = this.minHeight;
        this.imgSrc[i].width = this.minHeight * this.imgSrc[i].ratio;
        rowWidth = rowWidth + this.imgSrc[i].width;
        rowEnd = i;
        if (rowWidth > rowContainer.offsetWidth) { //最后的宽度要减去外层容器的内边距
            var lastWidth = rowWidth - this.imgSrc[i].width;
            var rowRatio = this.minHeight / lastWidth;
            var lastHeight = rowRatio * (rowContainer.offsetWidth - (rowEnd - rowStart - 1) * this.space - this.space * 2); //最后的每个盒子的margin是在这减去的			
            rows.push({
                rowStart: rowStart,
                rowEnd: rowEnd - 1,
                lastHeight: lastHeight,
                rowRatio: rowRatio,
            });
            rowStart = i; //下一行的起始图片编号
            rowWidth = this.imgSrc[i].width;
        }
    }
    // console.log(rows, 'rows');
    // console.log(this.imgSrc[rows[rows.length - 1].rowEnd]);
    //下次拿图片的起始编号为当前所有行中，最后一行的最后一张图片的index+1;
    // this.imgSrc[rows[rows.length-1].rowEnd]
    var nextIndex = this.imgSrc[rows[rows.length - 1].rowEnd].index + 1; //获得构成行的最后一张图片的标号
    // console.log(nextIndex, 'nextIndex');
    Barrel.prototype.nextIndex = nextIndex;
    for (var m = 0; m < rows.length; m++) {
        var imgRow = creEle('div');
        imgRow.className = 'imgRow';
        imgRow.style.marginBottom = this.space + 'px';
        for (var n = rows[m].rowStart; n <= rows[m].rowEnd; n++) {
            var imgBox = creEle('div');
            imgBox.className = 'imgBox';
            imgBox.style.paddingLeft = this.space / 2 + 'px';
            imgBox.style.paddingRight = this.space / 2 + 'px';
            var img = creEle('img');
            img.src = this.imgSrc[n].url;
            img.style.height = rows[m].lastHeight + 'px';
            // var showDiv=creEle('div');
            // showDiv.innerHTML=this.imgSrc[n].name;
            imgBox.appendChild(img);
            // imgBox.appendChild(showDiv);
            imgRow.appendChild(imgBox);
        }
        imgRow.style.width = rowContainer.offsetWidth + 'px';
        imgRow.style.height = rows[m].lastHeight + 'px';
        rowContainer.appendChild(imgRow);
    }
}
