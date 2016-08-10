function route(pathname,handle,request,response,params,num,pathname_img){
	if(typeof handle[pathname]==='function'){
		handle[pathname](request,response,pathname,params,num,pathname_img);
	}
	else{
		console.log(pathname,'该路径没有处理程序');
		response.writeHead(404,{"Content-type":"text/html"});
		var html="<html><meta charset='utf-8'><title>404</title><div>请求失败，服务器上没有该资源!</div></html>";
		response.end(html);
	}
}
exports.route=route;