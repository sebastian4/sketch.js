console.log("starting sketch");

$(function() {

  $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
    $('#colors_demo').append("<a href='#colors_sketch' data-color='" + this + "' style='width: 10px; background: " + this + ";'>__</a> ");
  });
  $.each([3, 5, 10, 15], function() {
    $('#colors_demo').append("<a href='#colors_sketch' data-size='" + this + "' style='background: #ccc'>" + this + "</a> ");
  });
  $('#colors_sketch').sketch();
  
  $('button#show-ocr-tools-core').on('click',function() {
      $('#overhead-ocr-tools-core').toggle('slow');
      console.log('ocr tools toggle');
  });
  $('#ocr-canvas').sketch();
    
  $('button#ocr-tool-submitimage').on('click',function() {
      var ajaxSubmitValue = {
        name : 'img'+getDateAndRandomNumber()+'.txt',
        value : localStorage.getItem("currentImage")
      };
      $.ajax({
        url: "scripts/aresponse.txt",
        type: "get",
        dataType: "text",
        data: JSON.stringify(ajaxSubmitValue),
        success: function(data){
            console.log("ajax success");
            $("#ocr-tool-result").html(data);
        },
        error:function(){
            console.log("ajax failure");
            $("#ocr-tool-result").html('error in submission');
        }
      });
      //$( "#ocr-tool-result" ).load( "scripts/aresponse.txt" );
  });
    
  function getDateAndRandomNumber() {
      var randomNumber = Math.floor((Math.random()*89)+10); // 10 to 99
      var currdate = new Date();
      return '-'+currdate.valueOf()+randomNumber;
  }
  
});
