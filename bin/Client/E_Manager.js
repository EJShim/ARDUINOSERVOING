var E_SocketManager = require("./E_SocketManager.js");
var E_ImageManager = require("./E_ImageManager.js");
var E_Interactor = require("./E_Interactor.js");

function E_Manager()
{

  var socketMgr = new E_SocketManager(this);
  var imgMgr = new E_ImageManager(this);

  var interactor = new E_Interactor(this);


  this.SocketMgr = function(){
    return socketMgr;
  }

  this.Interactor = function(){
    return interactor;
  }

  this.ImageMgr = function(){
    return imgMgr;
  }

  this.Initialize();

}


E_Manager.prototype.Initialize = function()
{
  this.Animate();
}

E_Manager.prototype.Animate = function()
{

  //Update Interactor
  this.Interactor().Update();
  this.ImageMgr().Update();

  requestAnimationFrame( this.Animate.bind(this) );
}

E_Manager.prototype.OnKeyDown = function(event)
{

  var interactor = this.Interactor();

  if(event.key == "w"){
    interactor.m_bUp = true;
    //Manager.SocketMgr().EmitData("SIGNAL_LOOKUP", null);
  }else if(event.key == "s"){
    interactor.m_bDown = true;
    //Manager.SocketMgr().EmitData("SIGNAL_LOOKDOWN", null);
  }else if(event.key == "a"){
    interactor.m_bL = true;
    //Manager.SocketMgr().EmitData("SIGNAL_LOOKLEFT", null);
  }else if(event.key == "d"){
    interactor.m_bR = true;
    //Manager.SocketMgr().EmitData("SIGNAL_LOOKRIGHT", null);
  }else if(event.key == " "){
    interactor.m_bSpace = true;
  }
}

E_Manager.prototype.OnKeyUp = function(event)
{
  var interactor = this.Interactor();

  if(event.key == "w"){
    interactor.m_bUp = false;
  }else if(event.key == "s"){
    interactor.m_bDown = false;
  }else if(event.key == "a"){
    interactor.m_bL = false;
  }else if(event.key == "d"){
    interactor.m_bR = false;
  }else if(event.key == " "){
    interactor.m_bSpace = false;
  }
}

E_Manager.prototype.RunRegistration = function(centerX, centerY, pointX, pointY)
{
  var xerr = centerX - pointX;
  var yerr = centerY - pointY;

  var errorRange = 10;
  if(xerr < -errorRange){
    //move left
    this.SocketMgr().EmitData("SIGNAL_LOOKRIGHT", xerr/10);
  }else if(xerr > errorRange){
    //move right
    this.SocketMgr().EmitData("SIGNAL_LOOKLEFT", xerr/10);
  }

  if(yerr < -errorRange){
    //move down
    this.SocketMgr().EmitData("SIGNAL_LOOKDOWN", yerr/10);
  }else if(yerr > errorRange){
    this.SocketMgr().EmitData("SIGNAL_LOOKUP", yerr/10);
  }

  if(xerr > -errorRange && xerr < errorRange && yerr > -errorRange && yerr < errorRange){
    this.SocketMgr().EmitData("SIGNAL_STOP", null);
  }

  document.getElementById("log").innerHTML = xerr + ", " + yerr;
}



module.exports = E_Manager;
