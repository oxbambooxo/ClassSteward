$(document).ready(function()
{
  //初始化编辑器
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
    if($("#publish").text()=="确认")//修改帖子
    {
      var pattern = new RegExp(/[^(&nbsp;)|^( )|^(<br>)]/g);
      if( !pattern.test($("#editor").html()))
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
          data:{modify_comment:"yes",text:$("#editor").html(),id:modify_comment}, 
          timeout: 10000,
          error: function(XMLHttpRequest, textStatus, errorThrown)
          {
            $("#publish").attr('data-content','修改失败');
            $("#publish").button('reset');
            $("#publish").popover("show");
            setTimeout(function(){$("#publish").popover("destroy");},2500);
          }, 
          success: function(data)
          {
            $("#title").val('');
            $("#publish").button('reset');
            $("#publish").attr('data-content','修改成功');
            $("#publish").popover("show");
            for(var i=0;i<$(".modify_comment").length;i++)
            {
              if($($(".modify_comment")[i]).attr("id")==modify_comment)
              {
                $($(".modify_comment")[i]).prev().html($("#editor").html());
                var today=new Date()
                var n=today.getFullYear()
                var y=today.getMonth()+1
                var d=today.getDate()
                var h=today.getHours()
                var m=today.getMinutes()
                var s=today.getSeconds()
                var time=n+"-"+y+"-"+d+" "+h+":"+m+":"+s
                $($(".modify_comment")[i]).parent().find("span:last").html("最后编辑于: "+time);
                modify_comment==0;
                break;
              }
            }
            $("#editor").html('');
            setTimeout(function()
            {
              $("#publish").popover("destroy");
              $("#publish").text("回复");
              $("#publish").removeClass("btn-default");
              $("#publish").addClass("btn-info");
              window.location.hash = '#'+modify_stair;
            },1500);
          }
        })
      }
    }
    else//新增回复
    {
      var pattern = new RegExp(/[^(&nbsp;)|^( )|^(<br>)]/g);
      if( !pattern.test($("#editor").html()))
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
          data:{new_comment:"yes",text:$("#editor").html(),topic:$("#topic").text()}, 
          timeout: 10000,
          error: function(XMLHttpRequest, textStatus, errorThrown)
          {
            $("#publish").attr('data-content','回复失败');
            $("#publish").button('reset');
            $("#publish").popover("show");
            setTimeout(function(){$("#publish").popover("destroy");},2500);
          }, 
          success: function(data)
          {
            $("#title").val('')
            $("#editor").html('');
            $("#publish").button('reset');
            $("#publish").attr('data-content','回复成功');
            $("#publish").popover("show");
            setTimeout(function(){$("#publish").popover("destroy");},1500);
            setTimeout(function(){location.replace("/forum/"+$("#subject").text()+'/'+$("#topic").text()+"?p="+data+"#newest")},1800);
          }
        })
      }
    }
  });

  $("article div p i").click(function()
  {
    $(this).parent().parent().parent().find("div.reply-boxs").fadeToggle();
  });

  $(".fast_reply").click(function()
  {
    var comment_id=$(this).attr("comment");
    var author_name=$(".index_username").text();
    var text=$(this).prev().val();
    var btn=$(this);
    var today=new Date()
    var n=today.getFullYear()
    var y=today.getMonth()+1
    var d=today.getDate()
    var h=today.getHours()
    var m=today.getMinutes()
    var s=today.getSeconds()
    var time=n+"-"+y+"-"+d+" "+h+":"+m+":"+s
    var s1='<a class="message-img"><img alt="" width="50" height="50"></a>\
            <div class="message-body">\
              <div class="text">';
    var s2='  </div>\
              <p class="attribution"><a>'+author_name+'</a> '+time+'</p>\
            </div>';
    $.post("/forum",{new_reply:'yes',content:text,comment:comment_id,href:window.location.href},function(data,status)
    {
      if(data=="reply comment success")
      {
        var reply_content = btn.parent().parent().parent().parent().find(".reply-content");
        var mess_body = reply_content.find(".message-body:last");
        if(reply_content.length==0)
        {
          var reply_boxs = btn.parent().parent().parent();
          reply_boxs.before(s1+text+s2);
        }
        else
        {
          if(mess_body.length>0)
          {
            mess_body.after(s1+text+s2);
          }
          else
          {
            reply_content.html(s1+text+s2);
          }
        }
        btn.prev().val("");
      }
    });
  });

  $(".delete_comment_confirm").click(function()
  {
    $(this).next().toggle();
  });

  $(".delete_comment").click(function()
  {
    var article=$(this).parent().parent().parent().parent();
    $.post("/forum",{delete_comment:"yes",comment:$(this).attr("comment")},function(data)
    {
      if(data=="delete comment success")
      {
        article.remove();
      }
    });
  });

  $(document).on("click",".delete_reply_confirm",function()
  {
    $(this).next().toggle();
  });

  $(document).on("click",".delete_reply",function()
  {
    var message_body=$(this).parent().parent().parent().parent();
    var message_img=message_body.prev();
    $.post("/forum",{delete_reply:"yes",reply:$(this).attr("reply")},function(data)
    {
      if(data=="delete reply success")
      {
        message_body.remove();
        message_img.remove();
      }
    });
  });

  var modify_comment;
  var modify_stair;
  $(".modify_comment").click(function()
  {
    $("#publish").text("确认");
    $("#publish").removeClass("btn-info");
    $("#publish").addClass("btn-default");
    modify_comment=$(this).attr("id");
    modify_stair=$(this).parent().parent().attr("id");
    $("#editor").html($(this).prev().html());
    window.location.hash = "#editor";
  });

  $("#scrolleditor").click(function()
  {
    console.log($("#editor").height());
    $("#editor").height($("#editor").height()+100);
  });
});
