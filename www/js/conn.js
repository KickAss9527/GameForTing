window.onload = function() {
    var hichat = new HiChat();
    hichat.init();
};
var HiChat = function() {
    this.socket = null;
};
HiChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
	        var btn = document.getElementById('myHeader');
          var input = document.getElementById('inp');
	        btn.onclick = function(){that.socket.emit('foo',allCards[0]);};

        });
        this.socket.on('bor', function(data){
	        alert(data.value);

        });
   }
}
