function E_SocketManager(Mgr)
{
  this.Mgr = Mgr;
  this.socket = io();
}

E_SocketManager.prototype.EmitData = function(signal, data)
{
  var socket = this.socket;
  socket.emit(signal, data);
}


module.exports = E_SocketManager;
