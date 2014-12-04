$(document).ready(function()
{
  $('#editor').wysiwyg({
    hotKeys: {
      'ctrl+b meta+b': 'bold',
      'ctrl+i meta+i': 'italic',
      'ctrl+u meta+u': 'underline',
      'ctrl+z meta+z': 'undo',
      'ctrl+y meta+y meta+shift+z': 'redo'
    }
  });
  function initToolbarBootstrapBindings() 
  {
    $('a[title]').tooltip({container:'body'});
    $('.dropdown-menu input').click(function(){return false;})
        .change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');})
    .keydown('esc', function () {this.value='';$(this).change();});
    $('[data-role=magic-overlay]').each(function () { 
        var overlay = $(this), target = $(overlay.data('target')); 
        overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
    });
    $('#voiceBtn').hide();
  };
  initToolbarBootstrapBindings();
  window.prettyPrint && prettyPrint();

  $("#publish").button('reset');
  $("#publish").click(function()
  {
    var pattern = new RegExp(/[^(&nbsp;)|^( )|^(<br>)]/g);
    if( pattern.test($("#title").val()) != true || pattern.test($("#editor").html()) != true)
    {
      $("#publish").attr('data-content','内容不能为空');
      $("#publish").button('reset');
      $("#publish").popover("show");
      setTimeout(function(){$("#publish").popover("destroy");},2500);
      return false;
    }
    else
    {
    $("#publish").button('loading');
    $.ajax(
    {
      type:"POST",
      url:"/forum",
      data:{new_topic:"yes",title:$("#title").val(),text:$("#editor").html(),subject:$("#subject").text()}, 
      timeout: 10000,
      error: function(XMLHttpRequest, textStatus, errorThrown)
      {
        $("#publish").attr('data-content','发送失败');
        $("#publish").button('reset');
        $("#publish").popover("show");
        setTimeout(function(){$("#publish").popover("destroy");},2500);
      }, 
      success: function(data)
      {
        $("#title").val('')
        $("#editor").html('');
        $("#publish").button('reset');
        $("#publish").attr('data-content','发表成功');
        $("#publish").popover("show");
        setTimeout(function(){$("#publish").popover("destroy");},1500);
        setTimeout(function(){location.replace("/forum/"+$("#subject").text()+"?p="+data+"#newest")},1800);
      }
    })
    }
  });

  $(".delete_topic_confirm").click(function()
  {
    $(this).next().toggle();
  });

  $(".delete_topic").click(function()
  {
    var tr=$(this).parent().parent().parent().parent();
    $.post("/forum",{delete_topic:"yes",topic:$(this).attr("topic")},function(data)
    {
      if(data=="delete topic success")
      {
        tr.remove();
      }
    });
  });

  $(".unstar_topic").click(function()
  {
    var topic = $(this).prev().find("button").attr("topic");
    $.post("/forum",{unstar_topic:"yes",topic:topic},function(data)
    {
      if(data == "unstart topic success")
      {
        location=location;
      }
    });
  });
  $(".star_topic").click(function()
  {
    var topic = $(this).prev().find("button").attr("topic");
    $.post("/forum",{star_topic:"yes",topic:topic},function(data)
    {
      if(data == "start topic success")
      {
        location=location;
      }
    });
  });

  $("#scrolleditor").click(function()
  {
    console.log($("#editor").height());
    $("#editor").height($("#editor").height()+100);
  });
});