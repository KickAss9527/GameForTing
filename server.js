var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname + '/www'));
server.listen(8888);
var length = 50;
var tmp = [];
for (var i = 0; i < length; i++) {
  tmp[i] = i;
}
tmp.sort(function(){return 0.5 - Math.random();});
var str = tmp.join(',');
console.log('server started');
console.log(str);


io.on('connection', function(socket) {
    //接收并处理客户端发送的foo事件
    socket.on('foo', function(data) {
        //将消息输出到控制台
        console.log(data+'111');
        socket.broadcast.emit('bor', data);
    })
});
