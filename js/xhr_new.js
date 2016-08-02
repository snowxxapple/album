var ajax=function(config){
	var url=config.url;
	var method=config.method;
	var sync=config.sync;
	var success=config.success;
	var fail=config.fail;
	var progress=config.progress;
	var data=config.data;
	var xhr=new XMLHttpRequest();
	xhr.onreadystatechange=function(){
		if(xhr.readystate==4){
			if(xhr.status>=200&&xhr.status<300||xhr.status==304){
				var resData=xhr.responseText;
				// success(resData);
				console.log(resData);
			}
			else{
				fail(resData);
			}
		}
	}
	xhr.open(method,url,sync);
	xhr.send(null);
}