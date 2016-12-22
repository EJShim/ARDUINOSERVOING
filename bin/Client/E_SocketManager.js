function E_SocketManager(Mgr)
{
  this.Mgr = Mgr;
  this.socket = io();

  this.HandleSignals();
}

E_SocketManager.prototype.EmitData = function(signal, data)
{
  var socket = this.socket;
  socket.emit(signal, data);
}

E_SocketManager.prototype.HandleSignals = function()
{

  var socket = this.socket;
  var Mgr = this.Mgr;

  socket.on("SIGNAL_INIT_SERVER", function(data){
    Mgr.m_bIsServer = true;
  });

  socket.on("SIGNAL_INIT_CLIENT", function(data){
    Mgr.m_bIsServer = false;
  });

  socket.on("SIGNAL_CANVASDATA", function(data){
    //console.log("canvas data received");
    Mgr.ImageMgr().DrawCanvasData(data);
  })

  socket.on("SIGNAL_CLICKCANVAS", function(data){
    Mgr.ImageMgr().OnReceiveClickData(data);
  });

}


module.exports = E_SocketManager;
