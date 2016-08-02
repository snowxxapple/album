function creEle(tag){
	var doc=document;
	return doc.createElement(tag);
}
function Waterfall(col,space,img){
	this.col=col;
	this.space=space;
	this.imgNum=40;//默认每次都是40
	this.imgArr=img;//图片数组
	//由于加载出的图片数组中，图片的Index不一定是按照大小顺序排序的，如果直接定义start和end为起始和末尾就会出现错误，一开始图片数目不对就是在这出的问题
}
Waterfall.prototype.colHeight=[];
//获得图片，创建图片数组,要获取图片的比率，需要在图片加载完成后才能获取，因此创建了图片标签
Waterfall.prototype.create=function(){
	console.log('创建图片');
	var oProgress=document.getElementsByTagName('progress')[0];
	oProgress.value=0;
	oProgress.style.display='block';
	this.Water_imgSrc=[];//存放的就是本次要显示的图片
	var count=0;//哨兵变量，用于判断图片是否都加载完
	var that=this;
	var allNum=this.imgNum;
	var startArr=[];
	for(var i=0;i<this.imgNum;i++){		
		var oImg=this.imgArr[i];
		var img=creEle('img');
		img.src=oImg.src;
		img.name=oImg.name;
		img.tag=oImg.tag;
		startArr.push(oImg.index);
		img.onload=function(){
			var _this=this;
			count=count+1;
			oProgress.value=count/allNum;
			console.log(count,'count');
			var width=this.naturalWidth;
			var height=this.naturalHeight;
			that.Water_imgSrc.push({
			ratio:width/height,
			url:_this.src,
			tag:_this.tag,
			name:_this.name
			});
			if(count==allNum){
				oProgress.style.display='none';
				console.log(count,'count');			
				count=0;
				that.render();
				Waterfall.prototype.imgLoad=true;
			}
		}
	}
}
//创建对应的列
Waterfall.prototype.createCol=function(){
	//控件大小
	Water_imgContainer=creEle('div');
	Water_imgContainer.className='img-container';
	Water_imgContainer.style.paddingLeft=this.space/2+'px';
	Water_imgContainer.style.paddingRight=this.space/2+'px';
	var oProgress=document.getElementsByTagName('progress')[0];
	var body=document.getElementsByTagName('body')[0];
	body.insertBefore(Water_imgContainer,oProgress);
	// document.body.appendChild(Water_imgContainer);
	var width=(100/this.col)+"%";
	for(var i=0;i<this.col;i++){
		var boxContainer=creEle('div');
		boxContainer.style.width=width;
		boxContainer.style.padding=this.space/2+'px';
		boxContainer.className='boxContainer';
		Water_imgContainer.appendChild(boxContainer);
	}
}
Waterfall.prototype.render=function(){
	console.log('开始渲染');
	var width=(100/this.col)+'%';
	var colHeight=Waterfall.prototype.colHeight;
	var boxContainer=document.getElementsByClassName('boxContainer');
	console.log(boxContainer,'boxContainer');
	var minIndex;
	for(var i=0;i<this.imgNum;i++){
		//创建盛放图片的div
		var imgBox=creEle('div');
		imgBox.style.marginBottom=this.space+'px';
		imgBox.className='img-box';
		//创建图片img标签  并设置图片大小
		var imgContent=creEle('img');
		imgContent.className='imgContent';
		imgContent.src=this.Water_imgSrc[i].url;
		imgContent.alt='这是一张图片';
		imgContent.style.width=100+'%';
		//创建图片信息div盒子
		var imgInfo=creEle('div');
		imgInfo.className='imgInfo';
		//创建图片名字div
		var imgName=creEle('div');
		imgName.className='img-name';
		imgName.innerHTML=this.Water_imgSrc[i].name;
		//创建图片分类标签div
		var imgTag=creEle('div');
		imgTag.className='img-tag';
		imgTag.innerHTML=this.Water_imgSrc[i].tag;
		//将盒子添加到DOM树中
		imgInfo.appendChild(imgName);
		imgInfo.appendChild(imgTag);
		imgBox.appendChild(imgContent);
		imgBox.appendChild(imgInfo);
		var showNum=document.getElementsByTagName('img').length;//判断当前body中的img数目，
		if(showNum<this.col+1){	
			//第一行
				boxContainer[i].appendChild(imgBox);
				imgContent.style.height=imgContent.offsetWidth/this.Water_imgSrc[i].ratio+'px';
				colHeight[i]=boxContainer[i].offsetHeight;
			}
		else{
			minIndex=colHeight.indexOf(Math.min.apply(Math,colHeight));
			boxContainer[minIndex].appendChild(imgBox);
			imgContent.style.height=imgContent.offsetWidth/this.Water_imgSrc[i].ratio+'px';
			colHeight[minIndex]=boxContainer[minIndex].offsetHeight;//更新高度
		}
		Waterfall.prototype.colHeight=colHeight;
		// console.log(Waterfall.prototype.colHeight,'原型上的列高');
	}
}