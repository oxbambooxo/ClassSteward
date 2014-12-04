$(document).ready(function()
{
    $(".modify_passwd_submit").click(function()
    {
        var user_account=$(".user_account").text();
        var passwd=$(this).parent().prev().find("input:first");
        if(passwd.val().length>=6)
        {
            var new_passwd=hex_md5(passwd.val());
            $.post("/admin",{modify_passwd:'yes',user_account:user_account,new_passwd:new_passwd},function(data,status)
            {
                if(data=="modify passwd success")
                {
                    $("#myModalLabel").text("修改成功！");
                    passwd.val("");
                    s=new_passwd+'<button type="button" class="btn btn-xs btn-default modify_passwd" data-toggle="modal" data-target="#myModal">修改</button>';
                    $(".modify_passwd").parent().html(s);
                    setTimeout(function(){$("#myModal").modal('hide');$("#myModalLabel").text("输入新密码");},1000);
                }
            });
        }
        else
        {passwd.val("")}
    });

    $('.selectpicker').selectpicker();
    $(".select_img").change(function()
    {
        $(".select_img_result").attr('src','/static/img/photo/'+$(this).val()+'.jpg');
    });
    $(".img_select").click(function()
    {
        $.post("/user",{modify_photo:"yes",photo:$(".select_img").val()},function(data)
        {
            if(data == "modify photo success")
            {
                $("#success").modal('show');
                setTimeout(function(){$("#success").modal('hide')},1200);
            }
        });
    });

    var jcrop_api;
    $(".img_upload").change(function()
    {
        var f = this.files[0];
        if (window.navigator.userAgent.indexOf("Chrome") >= 1 || window.navigator.userAgent.indexOf("Safari") >= 1 ) { 
            var src = window.webkitURL.createObjectURL(f); 
        } 
        else { 
            var src = window.URL.createObjectURL(f); 
        } 
        $(".img_windows").attr('src',src);
        $(".select_img_result").attr('src','');
        
        $(".img_windows").Jcrop({aspectRatio:1},function()
        {
            jcrop_api=this;
            jcrop_api.animateTo([0,0,200,200]);
        });

        $(this).hide();
    });
    $(".img_submit").click(function()
    {
        var value = jcrop_api.tellSelect();
        $("#w").val(value.w);
        $("#h").val(value.h);
        $("#x").val(value.x);
        $("#x2").val(value.x2);
        $("#y").val(value.y);
        $("#y2").val(value.y2);
        if(value.w){ $("#img_upload_submit").submit();}
    });

    $(".pagination li a").click(function()
    {
        if(!$(this).parent().hasClass("active"))
        {
            var btn = $(this);
            $.ajax(
            {
              url:"/user?page="+($(this).text()-1),
              success:function(data)
              {
                var s='';
                $(".user_comment_content").remove();
                for(var i=0;i<data['id'].length;i++)
                {
                  s+='<tr class="user_comment_content">\
                        <td>'+data['time'][i]+'</td>\
                        <td><a href="'+data['src'][i]+'" target="_blank">'+data['content'][i]+'</a></td>\
                        <td><button class="btn btn-default btn-xs delete_user_comment_confirm">删除</button>\
                            <button class="btn btn-danger btn-xs delete_user_comment" comment="'+data['id'][i]+'" style="display:none;">确定</button>\
                        </td>\
                      </tr>'
                }
                $(".user_comment_header").after(s);
                var li = $(".user_comment_footer").find("li");
                li.removeClass("active");
                btn.parent().addClass("active");
              },
              dataType:'json'
            });
        }
    });

    $(document).on("click",".delete_user_comment_confirm",function()
    {
        $(this).next().toggle();
    });

    $(document).on("click",".delete_user_comment",function()
    {
        var btn = $(this);
        $.post("/user",{delete_user_comment:"yes",comment:$(this).attr("comment")},function(data)
        {
            if(data == "delete comment success")
            {
                btn.parent().parent().remove();
            }
        });
    });
});