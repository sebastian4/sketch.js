console.log('\'Allo \'Allo!');

$(function() {
	
    $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#000', '#fff'], function() {
      $('#tools').append("<a href='#colored_sketch' data-color='" + this + "' style='border: 1px solid black; width: 30px; height: 30px; background: " + this + "; display: inline-block;'></a> ");
    });

    $('#colored_sketch').sketch();
    
    ////
    
    $('#simple_sketch').sketch();
});
