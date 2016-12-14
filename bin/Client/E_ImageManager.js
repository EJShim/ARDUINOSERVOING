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



  ////Control Frame Rate
  this.fps = 10;
  this.now;
  this.then = Date.now();
  this.interval = 1000/this.fps;
  this.delta;

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
          //$('#canvas').hide();
          $('#log').hide();
          // $('#no_rtc').html('<h4>WebRTC not available.</h4>');
          // $('#no_rtc').show();
      });
  } catch (error) {
      //$('#canvas').hide();
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



      this.now = Date.now();
      this.delta = this.now - this.then;

      if (this.delta > this.interval) {
         this.then = this.now - (this.delta % this.interval);

         var canvasData = this.canvas.toDataURL('image/jpeg', 1.0);
         this.Mgr.SocketMgr().EmitData("SIGNAL_CANVASDATA", canvasData);
      }


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

E_ImageManager.prototype.DrawCanvasData = function(data)
{
  var image = new Image(640, 480);
  image.src = data;
  var ctx = this.ctx;

  image.onload = function() {
    //console.log(this.ctx);
		ctx.drawImage(image, 0, 0, 640, 480);
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
    if(this.Mgr.m_bIsServer){
      this.curr_xy[0] = canvasX;
      this.curr_xy[1] = canvasY;
    }else{
      this.Mgr.SocketMgr().EmitData("SIGNAL_CLICKCANVAS", JSON.stringify({x:canvasX, y:canvasY}) );
    }

  }
}

E_ImageManager.prototype.OnReceiveClickData = function(data){
  var data = JSON.parse(data);

  this.curr_xy[0] = data.x;
  this.curr_xy[1] = data.y;
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
