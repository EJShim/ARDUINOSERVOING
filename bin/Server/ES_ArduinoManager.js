var five = require("johnny-five");

function ES_ArduinoManager(Mgr)
{
  this.Mgr = Mgr;
  this.wheels = {};

  this.initialized = false;
  this.Initialize();
}

ES_ArduinoManager.prototype.Initialize = function()
{
  var that = this;
  var board = new five.Board();

  board.on("ready", function() {
    that.InitMotor();
  });
}

ES_ArduinoManager.prototype.InitMotor = function()
{
  console.log("Motor Initialized");
  this.Initialized = true;

  this.wheels.Horizontal = new five.Servo({
     pin: 9,
     type: "continuous"
   });

   this.wheels.Vertical = new five.Servo({
     pin: 10,
     type: "continuous",
     invert: true // one wheel mounted inverted of the other
   });

}

ES_ArduinoManager.prototype.OnLookDown = function(speed)
{
  if(!this.Initialized) return;
  if(speed === null) speed = -1;
  console.log(speed);
  this.wheels.Vertical.step(speed);
}

ES_ArduinoManager.prototype.OnLookUp = function(speed)
{
  if(!this.Initialized) return;

  if(speed === null) speed = 1;
  console.log(speed);
  this.wheels.Vertical.step(speed);
}

ES_ArduinoManager.prototype.OnLookRight = function(speed)
{
  if(!this.Initialized) return;

  if(speed === null) speed = -1;
  console.log(speed);
  this.wheels.Horizontal.step(speed);
}

ES_ArduinoManager.prototype.OnLookLeft = function(speed)
{
  if(!this.Initialized) return;

  if(speed === null) speed = 1;
  console.log(speed);
  this.wheels.Horizontal.step(speed);
}

ES_ArduinoManager.prototype.OnStop = function()
{
  if(!this.Initialized) return;

  console.log("Stop Servoing");
  // this.wheels.Horizontal.stop();
  // this.wheels.Vertical.stop();
}




module.exports = ES_ArduinoManager;
