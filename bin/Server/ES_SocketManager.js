
function ES_SocketManager(Mgr, server)
{
  this.Mgr = Mgr;

  //Initialize WebSocket
  var m_io = require('socket.io').listen(server, {'forceNew':true });

  this.IO = function(){
    return m_io;
  }


  this.Initialize();

}

ES_SocketManager.prototype.Initialize = function()
{
  this.HandleSignal();

}

ES_SocketManager.prototype.HandleSignal = function()
{
  var io = this.IO();
  var that = this;



  io.sockets.on('connection', function(socket){
    //Initialize Chat
    console.log("New Connection!!");
    console.log(socket.handshake.address);

    socket.on("SIGNAL_LOOKUP", function(speed){
      that.Mgr.ArduinoMgr().OnLookUp(speed);
    });

    socket.on("SIGNAL_LOOKDOWN", function(speed){
      that.Mgr.ArduinoMgr().OnLookDown(speed);
    });

    socket.on("SIGNAL_LOOKLEFT", function(speed){
      that.Mgr.ArduinoMgr().OnLookLeft(speed);
    });

    socket.on("SIGNAL_LOOKRIGHT", function(speed){
      that.Mgr.ArduinoMgr().OnLookRight(speed);
    });

    socket.on("SIGNAL_STOP", function(){
      that.Mgr.ArduinoMgr().OnStop();
    });

    socket.on("SIGNAL_INITIALIZE", function(){
      that.Mgr.ArduinoMgr().InitMotor();
    });


    socket.once("disconnet", function(){
      console.log("A User Disconnected : ");
    });
  });
}

module.exports = ES_SocketManager;
