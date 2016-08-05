//创建一个http服务
var http = require('http');
var mongoose = require('mongoose');
var model1 = require('./model');
var imgModel = model1.imgModel;
var imgEnity = model1.imgEnity;
var url = require('url');
var path = require('path');

function start(route, handle) {
    //与数据库建立连接
    mongoose.connect("mongodb://localhost/test");
    //向数据库中插入文档
    // for(var i=0;i<118;i++){
    // 	var imgNum=i+1;
    // 	var imgEnity=new imgModel({tag:'测试相册5',name:"木桶布局",src:"./img5/"+imgNum+".jpg",index:imgNum});
    // 	imgEnity.save();
    // }
    //删除条目
    // imgModel.remove({tag:"测试相册5"},function(err,docs){
    // 	console.log(docs,'docs');
    // })
    http.createServer(function(request, response) {
        // console.log(request.headers);
        request.on('error', function(e) {
            console.log(e.message, '请求错误');
            response.writeHead(500, { 'Content-Type': 'application/x-javascript' });
            response.end(JSON.stringify(e.message));
        });
        var params = url.parse(request.url, true).query;
        // console.log(params,'params');
        var pathname = url.parse(request.url).pathname;
        var pathname_img = pathname;
        // console.log(pathname, 'pathname');
        var re = /\d+\.jpg/;//拿相册图片
        var re1=/backimg/;//拿背景图片和相册首页展示图片
        var re2=/\/js\/img/;//拿小图标
        var re3=/img\d{0,2}/;//相册名称范围img-img99
        var extName = path.extname(pathname);
        //相册图片
        if (extName == '.jpg') {
            pathname = 'jpg';
            var num = pathname_img.match(re);
            params=pathname_img.match(re3);
           // console.log(params,'匹配');//得到的是一个数组的形式['img','index':6,'input':'/html/img/1.jpg']
        }
        //背景图片以及其他图标
         if (pathname_img.search(re2)!=-1||pathname_img.search(re1)!=-1) {
            // pathname = "png";
            pathname='showImg';
        }
        //访问根目录
        if(pathname_img==='/'){
            pathname='/html/index.html';
        }
        //route里面的参数:简化后的路径名,处理函数,req,res,请求参数,图片编号,图片的真正路径
        route(pathname, handle, request, response, params,num,pathname_img);
    }).listen(3000);

    console.log('服务开启');
}
exports.start = start;
