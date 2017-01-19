var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname + '/www'));
server.listen(8888);

var CardConfig = require('./www/js/CardConfig.js');
var ServerConfig = require('./www/js/conn.js');
console.log('server started');

var iUserLogin = 0;
var arrUsers = {};
io.on('connection', function(socket) {

    //接收并处理客户端发送的foo事件
    socket.on(ServerConfig.Msg_Login, function(data) {
        arrUsers[iUserLogin] = data;
        console.log(arrUsers[iUserLogin] + ' login ~');
        iUserLogin++;
        socket.join(ServerConfig.Ser_Room);
        if (iUserLogin >= 1)
        {
          console.log('server : game start');
          var randomList = CardConfig.GenerateInitList();
          var msg = [randomList, arrUsers[0]];
          io.sockets.in(ServerConfig.Ser_Room).emit(ServerConfig.Msg_GameStart, msg);
        }

    })
});
