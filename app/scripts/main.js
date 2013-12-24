console.log("starting");

$(function() {

  $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
    $('#colors_demo').append("<a href='#colors_sketch' data-color='" + this + "' style='width: 10px; background: " + this + ";'>__</a> ");
  });
  $.each([3, 5, 10, 15], function() {
    $('#colors_demo').append("<a href='#colors_sketch' data-size='" + this + "' style='background: #ccc'>" + this + "</a> ");
  });
  $('#colors_sketch').sketch();
  
  $('#simple_sketch').sketch();
});
