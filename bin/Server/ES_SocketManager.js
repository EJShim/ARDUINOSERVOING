
function ES_SocketManager(Mgr, server)
{
  this.Mgr = Mgr;
  this.firstSocket = null;

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
  var firstSocket = null



  io.sockets.on('connection', function(socket){
    //Initialize Chat
    console.log("New Connection!!");

    if(socket.handshake.address == "::1"){
      console.log("server-side");
      firstSocket = socket;
      socket.emit("SIGNAL_INIT_SERVER");

    }else{
      console.log("not a server-sdie");

      socket.emit("SIGNAL_INIT_CLIENT");

    }

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

    socket.on("SIGNAL_CANVASDATA", function(data){
      socket.broadcast.emit('SIGNAL_CANVASDATA', data);
    })

    socket.on("SIGNAL_CLICKCANVAS", function(data){
      //Get Click Event from client
      if(firstSocket !== null){
        firstSocket.emit("SIGNAL_CLICKCANVAS", data);
      }
    });


    socket.once("disconnet", function(){
      console.log("A User Disconnected : ");
    });
  });
}

module.exports = ES_SocketManager;
