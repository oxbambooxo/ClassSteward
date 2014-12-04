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
    $('.dropdown-menu input').click(function() {return false;})
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
    $("#publish").button('loading');
    $.ajax(
    {
      type:"POST",
      url:"/broadcast",
      data:{update:"yes",text:$("#editor").html()}, 
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
        $("#editor").html('');
        $("#publish").button('reset');
        $("#publish").attr('data-content','发表成功');
        $("#publish").popover("show");
        setTimeout(function(){$("#publish").popover("destroy");},1500);
      }
    })
  });
});