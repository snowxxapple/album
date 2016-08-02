var ajax=function(config){
    var url=config.url;
    // console.log(url,'url');
    var method=config.method.toUpperCase();
    var sync=config.sync;
    var success=config.success;
    var fail=config.fail;
    var progress=config.progress;
    var data=config.data;
    var postData=null;
    // console.log(data,'请求数据');
    if(method=='POST'){
        postData=data;
    }
    if(method=='GET'){
        //拼接字符串 并把名和值都进行encodeURIComponent()编码
        if(data){
            for(var props in data){
                // console.log(data[props],'属性值');
                // console.log(url,'url');
                var bind=url.indexOf("?")==-1?"?":"&";
                url=url+bind+encodeURIComponent(props)+"="+encodeURIComponent(data[props]);
            }
            
        }
    }
    var xhr=new XMLHttpRequest();
    xhr.onreadystatechange=function(){
        if(xhr.readyState==4){
            if(xhr.status>=200&&xhr.status<300||xhr.status==304){
                var resData=xhr.responseText;
                // console.log(resData,'响应');
                success(resData);
            }
            else{
                fail(resData);
            }
        }
    }
    //异步才会触发 同步时是触发不了的
    xhr.upload.onprogress=function(evt){
        // console.log(evt,'evt');
        if(evt.lengthComputable){
            var percentComplete = evt.loaded / evt.total;
            progress(percentComplete);
        }
    }
    xhr.ontimeout=function(){
        alert('服务器无响应，请重新加载页面');
    }
    //超时设定
    // xhr.timeout=8000;//8秒没有收到回复，则自动断开请求
    xhr.open(method,url,sync);
    xhr.send(postData);
}