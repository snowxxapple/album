function route(pathname,handle,request,response,params,num,pathname_img){
	if(typeof handle[pathname]==='function'){
		handle[pathname](request,response,pathname,params,num,pathname_img);
	}
	else{
		console.log(pathname,'该路径没有处理程序');
	}
}
exports.route=route;