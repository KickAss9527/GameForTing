// window.onload = function() {
//     var con = new Con();
//     con.init();
// };

var ServerConfig = {
  Msg_Login : "login",
  Msg_GameStart : "start",
  Ser_Room : "room",
  Ser_Test : "test",
  Game_Collect : "collect",
  Game_PlayCard : "play",
  Game_Discard : "discard"
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
            that.socket.on(ServerConfig.Msg_GameStart, function(data)
            {
              gameInstance.cardRandomList = data[0];
              var firstHand = that.userId==data[1];
              gameInstance.state = firstHand ? GameState.PrepareFirstHand : GameState.PrepareSecondHand;
            }).on(ServerConfig.Game_PlayCard, function(data)
            {
              gameInstance.opponentPlayCard(data);
            });
        });
   },

   playCard : function(cardData, viewTag, idx){
     console.log(cardData.value + "_" + viewTag + "_" + idx);
     this.socket.emit(ServerConfig.Game_PlayCard, new Array(cardData, viewTag, idx));
   },

   playerReady : function()
   {
     this.socket.emit(ServerConfig.Msg_Login,this.userId);
   }
}
module.exports=ServerConfig;
