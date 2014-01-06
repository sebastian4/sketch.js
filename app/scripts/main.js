console.log("starting sketch");

$(function() {

  $.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
    $('#colors_demo').append("<a href='#colors_sketch' data-color='" + this + "' style='width: 10px; background: " + this + ";'>__</a> ");
  });
  $.each([3, 5, 10, 15], function() {
    $('#colors_demo').append("<a href='#colors_sketch' data-size='" + this + "' style='background: #ccc'>" + this + "</a> ");
  });
  $('#colors_sketch').sketch();
  
  ////
  
  $('button#show-ocr-tools-core').on('click',function() {
      $('#overhead-ocr-tools-core').toggle('slow');
      console.log('ocr tools toggle');
  });
  $('#ocr-canvas').sketch();
    
  $('button#ocr-tool-submitimage').on('click',function() {
  	  var randomName = 'img'+getDateAndRandomNumber();
      var ajaxSubmitValue = {
        name : randomName+'.png',
        value : localStorage.getItem("currentImage")
      };
      var resultWarning1 = "Click the following link:";
      var resultWarning2 = "Click the following link. For best results "
      	+"wait for about 30 seconds, then click on the link.";
      $.ajax({
        url: "scripts/getresponse.txt",
        type: "get",
        //contentType: "application/octet-stream",
        //dataType: "text",
        data: JSON.stringify(ajaxSubmitValue),
        success: function(data){
            console.log("ajax success");
            $("#ocr-tool-result").html("<div title='"+resultWarning2+"'>"+resultWarning1+"</div>"
            	+"<a href='"+getServerLocation()+data+"' title='"+resultWarning2+"' target='_blank'>"+randomName+"</a>");
        },
        error:function(){
            console.log("ajax failure");
            $("#ocr-tool-result").html('error in submission');
        }
      });
      //$( "#ocr-tool-result" ).load( "scripts/aresponse.txt" );
  });
  
  function getServerLocation() {
  	var currurl = window.location.protocol + '//'
  				+ window.location.host; 
  				//+ window.location.pathname;
  	console.log('server address: '+currurl);
  	return currurl;
  }
  
  function getDateAndRandomNumber() {
      var randomNumber = Math.floor((Math.random()*89)+10); // 10 to 99
      var currdate = new Date();
      return '-'+currdate.valueOf()+randomNumber;
  }
  
});
