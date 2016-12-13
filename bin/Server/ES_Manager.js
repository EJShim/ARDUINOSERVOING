var ES_SocketManager = require("./ES_SocketManager.js");
var ES_ArduinoManager = require("./ES_ArduinoManager.js");
var ES_Router = require('../../routes/ES_Router.js');

function ES_Manager(express, app)
{
  //Initialize Server.set('views', __dirname + '/../views');
  app.set('view engine', 'ejs');
  app.engine('html', require('ejs').renderFile);
  app.use(express.static('public'));

  var port = process.env.PORT || 8080;

  //Createe Server
  var server = require('http').createServer(app);


  //Open Server
  server.listen(port, function(){
      console.log("Express server has started on port " + port);
  });

  var m_router = new ES_Router(this, app);
  var m_socketManager = new ES_SocketManager(this, server);
  var m_ardManager = new ES_ArduinoManager(this);


  this.Router = function()
  {
    return m_router;
  }

  this.SocketMgr = function(){
    return m_socketManager;
  }

  this.ArduinoMgr = function(){
    return m_ardManager;
  }
}

ES_Manager.prototype.Destroy = function()
{
  var socket = this.socketMgr();
  this.MeshMgr().Destroy();
}

module.exports = ES_Manager;
