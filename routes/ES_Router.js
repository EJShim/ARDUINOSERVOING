var fs = require("fs");

function ES_Router(Mgr, app)
{
  this.Mgr = Mgr;
  this.app = app;

  this.Initialize();
}

ES_Router.prototype.Initialize = function()
{
  var app = this.app;
  var router = this;

  //TEST

  app.get('/',function(req,res){
    res.render('index.html')
  });

  app.get('/about',function(req,res){
    res.render('about.html');
  });

  app.post('/upload', function(req, res){
    //When Upload Mesh
    router.HandleFileUpload(req, res)
  });
}



module.exports = ES_Router;
