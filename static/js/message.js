$(document).ready(function()
{
  function new_message(id,origin,type,content,time)
  {
    var s1='<div id="'+id+'">\
            <article class="message" style="display:none;">\
              <a class="message-img">\
                <img src="/static/img/news/'+type+'.jpg" alt="'+type+'" width="50" height="50">\
              </a>\
              <div class="message-body">\
                <div class="text">'
    var s2='    </div>\
                <p class="attribution">来自： \
                  <a>'+origin+'</a>\
                  <i class="icon-comments"></i>\
                  <span>'+time+'</span>\
                </p>\
              </div>\
            </article>\
            </div>'
    if(type=="reply")
    {
      var object=eval("("+content+")")
      text='<a href="'+object[0]+'" target="_blank">您在 "'+object[1]+'" 下有一条新回复</a>'
      $('.messages').prepend(s1+text+s2)
    }
    else
    {
      $('.messages').prepend(s1+content+s2)
    }
    $('article:first').fadeIn(2000)
  }
  /*
  function append_reply_box(id)
  {
    s='<a class="message-img"><img width="50" height="50"></a>\
        <div class="message-body">\
          <div class="text ">\
            <input type="text" class="form-control" placeholder="快速回复">\
            <button type="button" class="btn btn-default btn-xs">回复</button>\
          </div>\
        </div>';
    $('#'+id+' article div.reply-body').append(s);
  }
  */

  function discover_message()
  {
    if(typeof(EventSource)!=="undefined")
    {
      var source=new EventSource("/message");
      source.onmessage=function(event)
      {
        var data=eval("("+event.data+")");
        for(var i=0;i<data.length;i++)
        {
          new_message(i,data[i][0],data[i][1],data[i][2],data[i][3])
        };
      };
    }
    else
    {
      alert("IE 浏览器不支持 EventSource,看来您查看不了消息提醒了……");
    }
    /*
    $.post("/broadcast",{request:'yes'},function(data,status)
    {
      for(var i=0;i<data.length;i++)
      {
        for(var j=0;j<data[i].length;j++)
        {
          if(j==0) new_message(i+1,data[i][j][0],data[i][j][1],data[i][j][2],data[i][j][3]);
          else new_reply(i+1,data[i][j][1],data[i][j][2],data[i][j][3]);
          if(j+1==data[i].length) append_reply_box(i+1);
        }
      }
      setTimeout(function(){discover_message()},5000);
    },
    "json"//指定post方式获得的结果是json类型,自动进行解析,不用手工eval.
    )
    */
  };

  setTimeout(function(){discover_message()},500);

  /*
  $(document).on("click",".message p i",function()
  //因为这些元素是动态生成的,所以默认函数不能绑定触发元素在其上,但可用事件触发.
  //将click事件冒泡到document,然后再判断触发元素是否为".message p i",再执行回调函数.
  {
    $(this).parent().parent().next().fadeToggle();
    //$(this)对象为".message p i"元素.
  });
  $(document).on("click","article div.reply-body button",function()
  {
    var message_id=$(this).parent().parent().parent().parent().parent().attr("id");
    var author_name=$(".nav.navbar-nav.navbar-right a.dropdown-toggle").text();
    var text=$(this).parent().find("input").val();
    var today=new Date()
    var n=today.getFullYear()
    var y=today.getMonth()+1
    var d=today.getDate()
    var h=today.getHours()
    var m=today.getMinutes()
    var s=today.getSeconds()
    var time=n+"-"+y+"-"+d+" "+h+":"+m+":"+s
    var s1='<a class="message-img">\
              <img alt="" width="50" height="50">\
            </a>\
            <div class="message-body">\
              <div class="text">';
    var s2='  </div>\
              <p class="attribution">by \
                <a href="#non">'+author_name+'</a> \
                <span>'+time+'</span>\
              </p>\
            </div>';
    $(this).parent().parent().prev().before(s1+text+s2);
    $(this).prev().val("");
    $.post("/broadcast",{modify:'yes',text:text,id:message_id},function(data,status){});
  });
  */

});

