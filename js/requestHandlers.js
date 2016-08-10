var fs = require('fs');
var mongoose = require('mongoose');
var dbModel = require('./model'); //'自己写的必须加./ 先引js文件，再调用文件中打包的模块和方法'
var imgModel = dbModel.imgModel;
var formidable = require('formidable');
var util = require('util');
//start函数 加载页面，将页面以及所包含的js，css文件返回给浏览器
function getSource(request, response, pathname) {
    var path_new = "." + pathname;
    fs.readFile(path_new, "utf-8", function(err, file) {
        if (err) {
            response.writeHead(404, { "Content-type": "text/html" });
            var html = "<html><meta charset='utf-8'><title>404</title><div>请求失败，服务器上没有该资源!</div></html>";
            response.end(html);
        } else {
            var re1 = /.js/;
            var re2 = /.css/;
            var re3 = /.html/;
            if (path_new.search(re1) != -1) {
                response.writeHead(200, { 'Content-Type': 'application/x-javascript', 'Cache-Control': 'max-age=86400' });
                response.end(file);
            }
            if (path_new.search(re2) != -1) {
                response.writeHead(200, { "Content-Type": "text/css", 'Cache-Control': 'max-age=86400' });
                response.end(file);
            }
            if (path_new.search(re3) != -1) {
                response.writeHead(200, { "Content-Type": "text/html" });
                response.end(file);
            }
        }
    });
}

function start(request, response, pathname) {
    var method = request.method;
    if (method == 'GET') {
        getSource(request, response, pathname);

    }
}
//从库里获得图片的信息，返回给前端图片的信息，图片加载不是在这里
function getImg(request, response, pathname, params) {
    // console.log(params, 'params');
    if (params["start"] === 'NaN') {
        console.log('出错啦');
        response.writeHead(500, { "Content-Type": "application/x-javascript" });
        response.write('出错啦！');
        response.end();
    } else {
        var start = Number(params['start']);
        var tag = params['tag'];
        var index = [];
        var arr = [];
        //查询数据库，在相应相册中，从start起开始查询
        imgModel.find({ 'tag': tag, 'index': { $gte: start } }, null, { limit: 40 }, function(err, docs) {
            if (err) {
                response.writeHead(500, { "Content-Type": "application/x-javascript" });
                response.end(JSON.stringify(err));
            }
            if (docs.length < 40) {
                var length = 40 - docs.length;
                imgModel.find({ 'tag': tag, 'index': { $gte: 1 } }, null, { limit: length }, function(err, newDocs) {
                    for (var i = 0; i < newDocs.length; i++) {
                        docs.push(newDocs[i]);
                    }
                    index.push(newDocs[newDocs.length - 1].index);
                    arr = index.concat(docs); //将最后一个图片的index返回
                    response.writeHead(200, { 'Content-Type': 'application/x-javascript' });
                    response.end(JSON.stringify(arr)); //把docs数组对象转化成JSON字符串,不能手动加{}进行转化，无意义
                });
            } else {
                index = [start + 40];
                arr = index.concat(docs);
                response.writeHead(200, { 'Content-Type': 'application/x-javascript' });
                response.end(JSON.stringify(arr)); //把docs数组对象转化成JSON字符串,不能手动加{}进行转化，无意义
            }
        });
    }
}
//数据库返回图片src后，前端过来拿图片
function getImg_new(request, response, pathname, paras, num, path_img) {
    console.log(paras, '参数');
    if (!paras) {
        console.log('没有这个资源');
        response.writeHead(404, { "Content-type": "text/html" });
        var html = "<html><meta charset='utf-8'><title>404</title><div>请求失败，服务器上没有该资源!</div></html>";
        response.end(html);
    } else {
        // console.log(path_img,'path_img');
        var path_new = paras[0];
        //返回需要的相册照片    
        var path_new = "./" + path_new + "/" + num[0];
        console.log(path_new, '目标路径');
        fs.readFile(path_new, 'binary', function(err, docs) {
            if (err) {
                console.log('错误');
                response.writeHead(404, { "Content-type": "text/html" });
                var html = "<html><meta charset='utf-8'><title>404</title><div>请求失败，服务器上没有该资源!</div></html>";
                response.end(html);
            } else {
                console.log(path_new, '路径');
                response.writeHead(200, { "Content-Type": "application/x-jpg" });
                response.end(docs, 'binary'); //一定要以二进制返回，否则会出错
            }
        });
    }
}
//除了相册里面的照片的其他图片
function showImg(request, response, pathname, paras, num, path_img) {
    // console.log(path_img, 'showImg');
    var path = "." + path_img;
    fs.readFile(path, 'binary', function(err, docs) {
        if (err) {
            response.writeHead(404, { "Content-type": "text/html" });
            var html = "<html><meta charset='utf-8'><title>404</title><div>请求失败，服务器上没有该资源!</div></html>";
            response.end(html);
        } else {
            response.writeHead(200, { "Content-Type": "text/x-jpg", 'Cache-Control': 'max-age=86400' });
            response.end(docs, 'binary');
        }
    });
}

function upload(request, response) {
    var method = request.method;
    var album; //album.json文件
    if (method == 'GET') {
        fs.readFile("./js/album.json", "utf-8", function(err, file) {
            if (err) {
                response.writeHead(500, { "Content-type": "text/html" });
                var html = "<html><meta charset='utf-8'><title>404</title><div>服务器错误！</div></html>";
                response.end(html);
            }
            album = file;
            response.writeHead(200, { "Content-Type": "application/x-javascript" });
            response.end(album);
        });
    }
    if (method == 'POST') {
        // console.log(album,'album_post');
        console.log('上传');
        var contentLength = request.headers["content-length"];
        var form = new formidable.IncomingForm();
        form.uploadDir = '/'; //给的是文件夹目录，底下的文件重命名是相对于这个而言的
        form.on("error", function(err) {
            console.log(err);
            response.writeHead(500, { "Content-Type": "application/x-javascript" });
            response.end(JSON.stringify(err));
        });
        form.parse(request, function(err, fields, files) {
            console.log(fields, files);
            if (err) {
                console.log(err);
                response.writeHead(500, { "Content-Type": "application/x-javascript" });
                response.end(JSON.stringify(err));
            } else {
                // console.log(fields,'fields');
                // console.log(files,'files');
                //尽管前端验证了，也要验证是否图片为空
                //如果没有上传图片
                if (files.upload.size == 0) {
                    response.writeHead(200, { "Content-Type": "application/x-javascript" });
                    response.end(JSON.stringify('上传图片为空'));
                }
                //验证是否为图片 与前端方法相同
                var res = /image\/\w+/;
                console.log(files.upload.type, 'type');
                if (!res.test(files.upload.type)) {
                    response.writeHead(200, { "Content-Type": "application/x-javascript" });
                    response.end(JSON.stringify(-1));
                }

                var count = 0; //哨兵变量
                var nextIndex; //设置当前图片的index
                var tag = fields.tag; //实例中的tag
                var description = fields.description; //实例中的name
                var img = fields.file; //图片二进制流
                var new_path; //图片的对应文件夹，由json文件夹读出
                function save_succ() {
                    console.log(count, 'count_success');
                    if (count == 2) {
                        count = 0;
                        console.log(album, 'album11111');
                        // console.log(typeof album,'类型');//string JSON字符串
                        var new_js = JSON.parse(album);
                        // console.log(typeof new_json,'转换后类型');//object
                        new_path = new_js[tag]; //通过变量来访问，必须用方括号表示法
                        var img_src = './' + new_path + '/' + nextIndex + '.jpg';
                        console.log(img_src, 'img_src');
                        var imgEnity = new imgModel({ "tag": tag, "name": description, "src": img_src, "index": nextIndex });
                        imgEnity.save();
                        fs.renameSync(files.upload.path, img_src);
                        response.writeHead(200, { "Content-Type": "application/x-javascript" });
                        response.end(JSON.stringify("上传成功"));
                    }
                }
                //get和post时都读了这个文件 尝试只读一次 但是没成功 先这么读两次
                fs.readFile("./js/album.json", "utf-8", function(err, file) {
                    if (err) {
                        response.writeHead(500, { "Content-Type": "application/x-javascript" });
                        response.end(JSON.stringify(err));
                    }
                    album = file; //json文件都出来是JSON字符串，要把JSON字符串转换成JS对象，才能取到属性值
                    // console.log(album,'album');
                    count++;
                    save_succ();
                });
                imgModel.find({ "tag": tag }, null, null, function(err, docs) {
                    if (err) {
                        response.writeHead(500, { 'Content-Type': 'text/plain' });
                        response.write(err);
                        response.end();
                    }
                    var arr = [];
                    for (var i = 0; i < docs.length; i++) {
                        arr.push(docs[i].index);
                    }
                    var maxIndex = Math.max.apply(Math, arr);
                    nextIndex = maxIndex + 1;
                    count++;
                    save_succ();
                });
            }
        });
    }

}
exports.start = start;
exports.getImg = getImg;
exports.getImg_new = getImg_new;
exports.upload = upload;
exports.showImg = showImg;
