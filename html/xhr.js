var xx = (function() {
    var xhr = new XMLHttpRequest();
    var  method2;
    function done(xhr) {
        console.log(xhr.responseText);
        console.log(xhr.responseXML);
    }
    function fail(xhr) {
        console.log(xhr.responseText);
        console.log(xhr.responseXML);
    }
    function ajax(data) {
        var url=data.url;
        var method=data.method;
        var sync=data.sync;
        xhr.onreadystatechante = function() {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                   return done(xhr);
                } else {
                    return fail(xhr);
                }
            }
        };
        xhr.open(method,url,sync);
        xhr.send(null);
    }
    return{"method":ajax};
})();
