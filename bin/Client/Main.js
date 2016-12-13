var E_Manager = require("./E_Manager.js");

var Manager = new E_Manager();

$( window ).keydown(function(event) {
  Manager.OnKeyDown(event);
});

$( window ).keyup(function(event) {
  Manager.OnKeyUp(event);
});
