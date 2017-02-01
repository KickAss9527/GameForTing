var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname + '/www'));
server.listen(8888);

var CardConfig = require('./www/js/CardConfig.js');
var ServerConfig = require('./www/js/conn.js');
console.log('server start!!!');

var iUserLogin = 0;
var arrUsers = {};
io.on('connection', function(socket) {

    //接收并处理客户端发送的foo事件
    socket.on(ServerConfig.Msg_Login, function(data) {
      if (iUserLogin >= 2) {
        arrUsers = {};
        iUserLogin = 0;
        console.log("new");
      }
        arrUsers[iUserLogin] = data;
        console.log(arrUsers[iUserLogin] + ' login ~');
        iUserLogin++;
        socket.join(ServerConfig.Ser_Room);
        if (iUserLogin%2 == 0)
        {
          console.log('server : game start, first : '+arrUsers[0]);
          var randomList = CardConfig.GenerateInitList();
          var msg = [randomList, arrUsers[0]];
          io.sockets.in(ServerConfig.Ser_Room).emit(ServerConfig.Msg_GameStart, msg);
        }
    }).on(ServerConfig.Game_PlayCard, function(data){
      socket.broadcast.to(ServerConfig.Ser_Room).emit(ServerConfig.Game_PlayCard, data);
    }).on(ServerConfig.Game_Discard, function(data){
      console.log(data);
      if (data[0])
      {
          var randList = CardConfig.GenerateRandomList(data[0]);
          data[0] = randList;
          console.log(randList);
      }
      else data = null;
      io.sockets.in(ServerConfig.Ser_Room).emit(ServerConfig.Game_Discard, data);
    }).on(ServerConfig.Game_Collect, function(data){
      socket.broadcast.to(ServerConfig.Ser_Room).emit(ServerConfig.Game_Collect, data);
    }).on(ServerConfig.Game_MoreCards, function(data){
      console.log(data);
      if (data[0])
      {
          var randList = CardConfig.GenerateRandomList(data[0]);
          data[0] = randList;
          console.log(randList);
      }
      else data = null;
      io.sockets.in(ServerConfig.Ser_Room).emit(ServerConfig.Game_MoreCards, data);
    });
});
