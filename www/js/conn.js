// window.onload = function() {
//     var con = new Con();
//     con.init();
// };

var ServerConfig = {
  Msg_Login : "login",
  Msg_GameStart : "start",
  Ser_Room : "room",
  Ser_Test : "test"
}


var Con = function() {
    this.socket = null;
    this.userId = Date().toString();
};
Con.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function(socket) {
            console.log('link to server ok!');

        });

        this.socket.on(ServerConfig.Msg_GameStart, function(data){
          var list = data[0];
          var firstHand = that.userId==data[1];
          alert(data[1]+'_'+that.userId);
          if (firstHand)
          {
              console.log(that.userId);
              
          }
        });

        this.socket.on(ServerConfig.Ser_Test, function(data){alert(t);});

   },

   playerReady : function()
   {
     this.socket.emit(ServerConfig.Msg_Login,this.userId);
   }
}
module.exports=ServerConfig;
