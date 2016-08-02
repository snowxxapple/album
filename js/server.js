//创建一个http服务
var http=require('http');
var mongoose=require('mongoose');
var model1=require('./model');
var imgModel=model1.imgModel;
var imgEnity=model1.imgEnity;
var url=require('url');
var path=require('path');
function start(route,handle){
	//建数据库
	mongoose.connect("mongodb://localhost/test");
	// for(var i=0;i<70;i++){
	// 	var imgNum=i+1;
	// 	var imgEnity=new imgModel({tag:'测试相册',name:i,src:"./img/"+imgNum+".jpg",index:imgNum});
	// 	imgEnity.save();
	// }
	http.createServer(function(request,response){
		request.on('error',function(e){
			console.log(e.message,'请求错误');
			response.writeHead(500,{'Content-Type':'application/x-javascript'});
			response.end(JSON.stringify(e.message));
		});
		var params=url.parse(request.url,true).query;
		// console.log(params,'params');
		var pathname=url.parse(request.url).pathname;
		var pathname_img=pathname;
		console.log(pathname,'pathname');
		var re=/\d+\.jpg/;
		var num=pathname.match(re);
		// console.log(num,'图片编号');
		var extName=path.extname(pathname);
		if(extName=='.jpg'){
			pathname='jpg';
		}
		if(extName=='.png'){
			pathname="png";
		}		
		// console.log(pathname,'路径名');
		route(pathname,handle,request,response,params,num,pathname_img);		
	}).listen(3000);

	console.log('服务开启');
}
exports.start=start;
