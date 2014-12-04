$(document).ready(function()
{
  $(".pagination li a").click(function()
    {
      if(!$(this).parent().hasClass("active"))
      {
        var btn = $(this);
        $.ajax(
        {
          url:"/reply/"+$(this).attr("comment")+'/'+$(this).text(),
          success:function(data)
          {
            var s='';
            for(var i=0;i<data['id'].length;i++)
            {
              var user_id = $(".index_username").attr('id');
              if(user_id < 500)
              {
                var del_btn = '<button type="button" class="close delete_reply_confirm"><span aria-hidden="true">&times;</span></button>\
                              <div style="position:relative;display:none;">\
                                <div class="alert alert-danger" role="alert" style="position:absolute;right:0px;z-index:99;">是否删除该快捷回复？<button type="button" class="btn btn-danger btn-xs delete_reply" reply="'+data['id'][i]+'">确定</button>\
                                </div>\
                              </div>'
              }
              else
              {
                var del_btn = ''
              }
              s+='<a class="message-img"><img width="50" height="50" style="visibility:hidden;"/></a>\
                  <div class="message-body">\
                    <div class="text">'+data['content'][i]+del_btn+'</div>\
                    <p class="attribution"><a>'+data['author'][i]+'</a> '+data['time'][i]+'</p>\
                  </div>'
            }
            var reply_content = btn.parent().parent().parent().parent().find(".reply-content");
            reply_content.html(s);
            var li = btn.parent().parent().find("li");
            li.removeClass("active");
            btn.parent().addClass("active");
          },
          dataType:'json'
        });
      }
    });
});