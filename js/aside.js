var aside={
	asideBar:function(){
		var doc=document;
		var oProgress=doc.getElementsByTagName('progress')[0];
		var oLink=document.createElement('a');
		console.log(oLink);
		oLink.innerHTML='上传图片';
		oLink.className='oLink';
		oLink.href='../html/upload_new.html';
		document.body.insertBefore(oLink,oProgress);
	}
};