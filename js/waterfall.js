function creEle(tag){
	var doc=document;
	return doc.createElement(tag);
}
function Waterfall(col,space){
	this.col=col;
	this.space=space;
	this.options={
		imgNum:40,
		baseUrl:'http://placehold.it/'
	}
}
function getColor(){
	return Math.random().toString(16).substring(2,8);
}
Waterfall.prototype.init=function(){
	//创建图片
	this.create();
	//创建对应列数的列
	this.createCol();
	//实现布局
	this.render();
}
//创建图片
Waterfall.prototype.create=function(){
	//生成占位图片 没有添加到文档树中
	this.Water_imgSrc=[];
	for(var i=0;i<this.options.imgNum;i++){
		var width=Math.floor(Math.random()*300+100);//[100,400)
		var height=Math.floor(Math.random()*300+100);//[300,400)
		var color=getColor();
		this.Water_imgSrc.push({
			url:this.options.baseUrl+width+'x'+height+"/"+color+"/fff",
			ratio:width/height
		});
	}
}
//创建对应列数的列
Waterfall.prototype.createCol=function(){
	Water_imgContainer=creEle('div');
	Water_imgContainer.className='img-container';
	Water_imgContainer.style.paddingLeft=this.space/2+'px';
	Water_imgContainer.style.paddingRight=this.space/2+'px';
	document.body.appendChild(Water_imgContainer);
	var width=(100/this.col)+'%';
	for(var i=0;i<this.col;i++){
		var boxContainer=creEle('div');
		boxContainer.style.width=width;
		boxContainer.style.padding=this.space/2+'px';
		boxContainer.className='boxContainer';
		Water_imgContainer.appendChild(boxContainer);	
	}
}
Waterfall.prototype.render=function(){
	var width=(100/this.col)+'%';
	// var width=(this.screenWidth-this.space-this.col*2)/this.col-this.space;
	var colHeight=[];//存放列的高度
	var boxContainer=document.getElementsByClassName('boxContainer');
	var minIndex;
	for(var i=0;i<this.options.imgNum;i++){
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
		imgName.innerHTML='这是第'+i+'张图片';
		//创建图片分类标签div
		var imgTag=creEle('div');
		imgTag.className='img-tag';
		//将盒子添加到DOM树中
		imgInfo.appendChild(imgName);
		imgInfo.appendChild(imgTag);
		imgBox.appendChild(imgContent);
		imgBox.appendChild(imgInfo);
		if(i<this.col){
			boxContainer[i].appendChild(imgBox);
			//在没把元素添加到DOM树中时，元素获取到的高度是为0的，因此一定要在添加到DOM树中后获取元素宽高，并且img标签不设置
			//宽高，是撑不起div的高度的，现在是设置了图片的具体高度，但是这样会导致图片不是高度自适应的
			// console.log(imgBox.offsetWidth,'盒子宽度1');
			// console.log(imgContent.offsetWidth,'图片宽度1');
			// console.log(imgContent.offsetHeight,'图片高度1');
			// console.log(imgContent.clientHeight,'图片高度？');
			imgContent.style.height=imgContent.offsetWidth/this.Water_imgSrc[i].ratio+'px';
			colHeight[i]=boxContainer[i].offsetHeight;
		}
		else{
			// console.log(imgBox.offsetHeight,'盒子高度2');
			// console.log(imgBox.offsetWidth,'盒子宽度2');
			minIndex=colHeight.indexOf(Math.min.apply(Math,colHeight));
			boxContainer[minIndex].appendChild(imgBox);
			imgContent.style.height=imgContent.offsetWidth/this.Water_imgSrc[i].ratio+'px';
			colHeight[minIndex]=boxContainer[minIndex].offsetHeight;//更新高度
		}
		// console.log(colHeight,'列高');
	}
}