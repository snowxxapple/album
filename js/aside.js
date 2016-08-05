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
};