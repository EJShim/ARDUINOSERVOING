(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function E_ImageManager(Mgr)
{
  this.Mgr = Mgr;

  this.video = document.getElementById('webcam');
  this.canvas = document.getElementById('canvas');
  this.ctx = this.canvas.getContext('2d');


  this.corners = [];
  this.imgu8;

  //Image Pyranids
  this.curr_img_pyr = new jsfeat.pyramid_t(3);
  this.prev_img_pyr = new jsfeat.pyramid_t(3);

  this.point_status = new Uint8Array(1);
  this.prev_xy = new Float32Array(2);
  this.curr_xy = new Float32Array(2);

  this.Initialize();
}


E_ImageManager.prototype.Initialize = function()
{
  var that = this;
  var video = this.video;
  var canvas = this.canvas;
  var ctx = this.ctx;

  try {
      var attempts = 0;
      var readyListener = function(event) {
          findVideoSize();
      };
      var findVideoSize = function() {
          if(video.videoWidth > 0 && video.videoHeight > 0) {
              video.removeEventListener('loadeddata', readyListener);
              onDimensionsReady(video.videoWidth, video.videoHeight);
          } else {
              if(attempts < 10) {
                  attempts++;
                  setTimeout(findVideoSize, 200);
              } else {
                  onDimensionsReady(640, 480);
              }
          }
      };


      var onDimensionsReady = function(width, height) {
          that.DemoApp();
      };

      video.addEventListener('loadeddata', readyListener);

      compatibility.getUserMedia({video: true}, function(stream) {
          try {
              video.src = compatibility.URL.createObjectURL(stream);
          } catch (error) {
              video.src = stream;
          }
          setTimeout(function() {
                  video.play();
              }, 500);
      }, function (error) {
          $('#canvas').hide();
          $('#log').hide();
          $('#no_rtc').html('<h4>WebRTC not available.</h4>');
          $('#no_rtc').show();
      });
  } catch (error) {
      $('#canvas').hide();
      $('#log').hide();
      $('#no_rtc').html('<h4>Something goes wrong...</h4>');
      $('#no_rtc').show();
  }


  //Add Click Event Listner
  canvas.addEventListener('click', this.OnClickCanvas.bind(this), false);
}

E_ImageManager.prototype.DemoApp = function()
{
  var canvas = this.canvas;
  var ctx = this.ctx;

  canvasWidth  = canvas.width;
  canvasHeight = canvas.height;

  ctx.fillStyle = "rgb(0,255,0)";
  ctx.strokeStyle = "rgb(0,255,0)";

  //Allocate Image Pyramids
  this.curr_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);
  this.prev_img_pyr.allocate(640, 480, jsfeat.U8_t|jsfeat.C1_t);

}

E_ImageManager.prototype.Update = function()
{
  //Update Webcam Video
  if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.ctx.drawImage(this.video, 0, 0, 640, 480);

      var imageData = this.ctx.getImageData(0, 0, 640, 480);



          // swap flow data
          var _pt_xy = this.prev_xy;
          this.prev_xy = this.curr_xy;
          this.curr_xy = _pt_xy;
          var _pyr = this.prev_img_pyr;
          this.prev_img_pyr = this.curr_img_pyr;
          this.curr_img_pyr = _pyr;

          //GrayScale
          jsfeat.imgproc.grayscale(imageData.data, 640, 480, this.curr_img_pyr.data[0]);


          //Image Pyramid
          this.curr_img_pyr.build(this.curr_img_pyr.data[0], true);


          //Optical flow
          jsfeat.optical_flow_lk.track(this.prev_img_pyr, this.curr_img_pyr, this.prev_xy, this.curr_xy, 1, 20, 30, this.point_status, 0.1, 0);


          this.PruneOflowPoints();


          this.DrawCircle(this.canvas.width/2, this.canvas.height/2);

      //Put Image Data
      //this.ctx.putImageData(imageData, 0, 0);
  }
}

E_ImageManager.prototype.RenderCorners = function(corners, count, img, step)
{
    var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
    for(var i=0; i < count; ++i)
    {
        var x = corners[i].x;
        var y = corners[i].y;
        var off = (x + y * step);
        img[off] = pix;
        img[off-1] = pix;
        img[off+1] = pix;
        img[off-step] = pix;
        img[off+step] = pix;
    }
}

E_ImageManager.prototype.OnClickCanvas = function(e)
{
  var totalOffsetX=0,totalOffsetY=0,canvasX=0,canvasY=0;
  var currentElement = this.canvas;

  do {
      totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
      totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
  } while(currentElement = currentElement.offsetParent)

  canvasX = event.pageX - totalOffsetX;
  canvasY = event.pageY - totalOffsetY;

  console.log(canvasX + ", " + canvasY);

  if(canvasX > 0 & canvasY > 0 & canvasX < this.canvas.width & canvasY < this.canvas.height) {
      this.curr_xy[0] = canvasX;
      this.curr_xy[1] = canvasY;

  }
}


E_ImageManager.prototype.DrawCircle = function(x, y) {
  var ctx = this.ctx;

  // document.getElementById("log").innerHTML = "Clicked Point Coordinate : " + x + ", " + y + "<br>" +
  //                                           "Point Status" + this.point_status[0];

  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}

E_ImageManager.prototype.PruneOflowPoints = function()
{

  if(this.point_status[0] == 1){
    var centerX = this.canvas.width/2;
    var centerY = this.canvas.height/2;

    this.DrawCircle(this.curr_xy[0], this.curr_xy[1]);

    this.Mgr.RunRegistration(centerX, centerY, this.curr_xy[0], this.curr_xy[1]);

  }else{

  }
}


module.exports = E_ImageManager;

},{}],2:[function(require,module,exports){
function E_Interactor(Mgr)
{
  this.Mgr = Mgr;

  this.m_bUp = false;
  this.m_bDown = false;
  this.m_bR = false;
  this.m_bL = false;
  this.m_bSpace = false;
}


E_Interactor.prototype.Update = function()
{
  if(this.m_bUp){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKUP", null);
  }

  if(this.m_bDown){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKDOWN", null);
  }

  if(this.m_bR){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKRIGHT", null);
  }

  if(this.m_bL){
    this.Mgr.SocketMgr().EmitData("SIGNAL_LOOKLEFT", null);
  }

  if(this.m_bSpace){
    this.Mgr.SocketMgr().EmitData("SIGNAL_INITIALIZE", null);
  }
}

module.exports = E_Interactor;

},{}],3:[function(require,module,exports){
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

  document.getElementById("log").innerHTML = xerr + ", " + yerr;
}



module.exports = E_Manager;

},{"./E_ImageManager.js":1,"./E_Interactor.js":2,"./E_SocketManager.js":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var E_Manager = require("./E_Manager.js");

var Manager = new E_Manager();

$( window ).keydown(function(event) {
  Manager.OnKeyDown(event);
});

$( window ).keyup(function(event) {
  Manager.OnKeyUp(event);
});

},{"./E_Manager.js":3}]},{},[5]);
