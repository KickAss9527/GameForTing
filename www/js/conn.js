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
	        btn.onclick = function(){that.socket.emit('foo','helo');};
			alert(btn);
        });
   }
}