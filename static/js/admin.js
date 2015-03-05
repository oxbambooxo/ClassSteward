$(document).ready(function()
{
    $(".new_forum").click(function()
    {
        var table=$(this).parent().parent().parent().parent().find(".forum_check");
        var new_name=$(this).parent().prev().prev().find("[name='name']");
        var new_nickname=$(this).parent().prev().find("[name='nickname']");
        var td_form=$(this).parent().parent();
        var new_forum_status=1;
        var check=$(this).parent().parent().parent().find(":text");
        for(var i=0;i<check.length;i++)
        {
            if($(check[i]).val()=="")
            {
                new_forum_status=0;
                td_form.removeClass("success");
                td_form.addClass("danger");
                setTimeout(function(){td_form.removeClass("danger");},1500);
            }
            else
            {
                td_form.removeClass("danger");
                td_form.addClass("success");
            }
        }
        for(var i=0;i<=table.length;i++)
        {
            if($(table[i]).html()!=undefined)
            {
                if($(table[i]).html()==new_name.val())
                {
                    new_name.attr("placeholder","论坛标识与已有标识冲突");
                    new_name.val("");
                    setTimeout(function()
                    {
                        new_name.attr("placeholder","");
                    },5000);
                    td_form.removeClass("success");
                    td_form.addClass("danger");
                    setTimeout(function(){td_form.removeClass("danger");},1500);
                    new_forum_status=0;
                }
                if($(table[i]).html()==new_nickname.val())
                {
                    new_nickname.attr("placeholder","论坛名称与已有标识冲突");
                    new_nickname.val("");
                    setTimeout(function()
                    {
                        new_nickname.attr("placeholder","");
                    },5000);
                    td_form.removeClass("success");
                    td_form.addClass("danger");
                    setTimeout(function(){td_form.removeClass("danger");},1500);
                    new_forum_status=0;
                }
            }
        }
        if(new_forum_status==1)
        {
            $('#addition_new_forum').submit();
        }
    });

    $(".delete_forum").click(function()
    {
        var forum_name=$(this).parent().parent().find("td:first").text();
        var forum_tab=$(this).parent().parent()
        $.post("/admin",{delete_forum:forum_name},function(data,status)
        {
            forum_tab.remove();
        })
    });

    var user_account;
    $(".modify_passwd").click(function()
    {
        user_account=$(this).parent().parent().find(".user_account").text();
    });
    
    $(document).on("click",".btn.btn-primary.modify_passwd_submit",function()
    {
        var passwd=$("#new_passwd");
        if(passwd.val().length>=6)
        {
            var new_passwd=hex_md5(passwd.val());
            $.post("/admin",{modify_passwd:'yes',user_account:user_account,new_passwd:new_passwd},function(data,status)
            {
                $("#myModalLabel").text("修改成功！");
                setTimeout(function(){$("#myModal").modal('hide')},1000);
                $("#new_passwd").val("");
                setTimeout(function(){$("#myModalLabel").text("输入新密码")},1500);
            });
        }
        else
        {
            passwd.val("");
        }
    });

    var new_state=0;
    function test_input()
    {
        var input=$("#new_admin").parent().parent();
        if ($("#new_admin").val() == '') 
        {
            input.removeClass("warning");
            input.removeClass("success");
            input.addClass("danger");
            $("#add_help").text("格式不正确");
            $("#new_admin").val("");
            setTimeout(function()
            {
                input.removeClass("danger");
                $("#add_help").text("请输入用户名");
            },2000);
            new_state=0;
        }
        else
        {
            $.get('/regist?request="'+$("#new_admin").val()+'"',function(data,status)
            {
                if(data=="the user is exist.")
                {
                    input.removeClass("warning");
                    input.removeClass("danger");
                    input.addClass("success");
                    new_state=1;
                }
                else
                {
                    input.removeClass("danger");
                    input.removeClass("success");
                    input.addClass("warning");
                    $("#add_help").text("用户不存在");
                    $("#new_admin").val("");
                    setTimeout(function()
                    {
                        input.removeClass("warning");
                        $("#add_help").text("请输入用户名");
                    },2000);
                    new_state=0;
                }
            });
        }
    }
    $("#new_admin").change(function()
    {
        test_input();
    });
    $(".addition_admin").click(function()
    {
        test_input();
        if(new_state==1)
        {
            $.post("/admin",{new_admin:"yes",user_account:$("#new_admin").val()},function(data,status)
            {
                userinfo=eval("("+data+")");
                s='<tr>\
                   <td>'+userinfo[0]+'</td>\
                   <td>'+userinfo[1]+'</td>\
                   <td>'+userinfo[2]+'</td>\
                   <td>'+userinfo[3]+'</td>\
                   <td>'+userinfo[4]+'\
                       <button type="button" class="btn btn-default btn-xs cancel_admin" style="float:right;">取消</button>\
                   </td>\
                   </tr>';
                
                var id=$(".addition_admin").parent().parent().parent().find(".id_check");
                k=1;
                for(var i=0;i<id.length;i++)
                {
                    if($(id[i]).text()==userinfo[0]) k=0;
                }
                var user_tab=$(".addition_admin").parent().parent();
                if(k==1)
                {
                    user_tab.before(s);
                    user_tab.prev().show();
                }

                var input=$("#new_admin").parent().parent();
                input.removeClass("warning");
                input.removeClass("success");
                input.removeClass("danger");
                $("#add_help").text("请输入用户名");
                $("#new_admin").val("");
            });
        }
    });
    
    $(document).on("click",".cancel_admin",function()
    {
        var cancel_account=$(this).parent().parent().find("td:first").next().text();
        var cancel=$(this).parent().parent();
        $.post("/admin",{cancel_admin:'yes',cancel_account:cancel_account},function()
        {
            cancel.remove();
        });
    });

    $(document).on("click",".delete_user_confirm",function(){$(this).parent().find(".alert_delete_user").toggle()});
    $(".delete_user").click(function()
    {
        var account=$(this).parent().parent().parent().parent().find(".user_account").text();
        var user_tr=$(this).parent().parent().parent().parent();
        $.post("/admin",{delete_user:"yes",user_account:account},function(data,status)
        {
            if(data=="delete user success")
            {
                user_tr.remove();
            }
        });
    });

    $(".alert_modify_class").css("left",function()
    {
        var thlist=$("#user_total").find("table:first").find("tr:first").find("th");
        sum_width=0;
        for(var i=0;i<3;i++)
        {
            sum_width+=Number($(thlist[i]).css("width").split('px')[0]);
        }
        return sum_width;
    });
    $(".alert_modify_num").css("left",function()
    {
        var thlist=$("#user_total").find("table:first").find("tr:first").find("th");
        sum_width=0;
        for(var i=0;i<4;i++)
        {
            sum_width+=Number($(thlist[i]).css("width").split('px')[0]);
        }
        return sum_width;
    });
    $(".alert_modify_name").css("left",function()
    {
        var thlist=$("#user_total").find("table:first").find("tr:first").find("th");
        sum_width=0;
        for(var i=0;i<5;i++)
        {
            sum_width+=Number($(thlist[i]).css("width").split('px')[0]);
        }
        return sum_width;
    });

    $(document).on("click",".modify_class_confirm",function(){$(this).parent().parent().find(".alert_modify_class").toggle()});
    $(document).on("click",".modify_num_confirm",function(){$(this).parent().parent().find(".alert_modify_num").toggle()});
    $(document).on("click",".modify_name_confirm",function(){$(this).parent().parent().find(".alert_modify_name").toggle()});

    $(".modify_class").click(function()
    {
        var id=$(this).parent().parent().parent().attr("user_id");
        var old_class=$(this).parent().parent().parent().parent().find(".modify_class_confirm").parent();
        var new_class=$(this).prev();
        var num=$(this).parent().parent().parent().parent().find(".modify_num_confirm").parent().text().replace("修改","");
        var name=$(this).parent().parent().parent().parent().find(".modify_name_confirm").parent().text().replace("修改","");
        var alert_class=$(this).parent();
        if(/^\d{4}$/.test(new_class.val()))
        {
            $.post("/admin",{modify_class:"yes",old_class:old_class.text().replace("修改",""),new_class:new_class.val(),num:num,name:name,user_id:id},function(data)
            {
                if(data=="modify class success")
                {
                    alert_class.toggle();
                    s='<button type="button" class="btn btn-xs btn-default modify_class_confirm" style="float:right;">修改</button></td>';
                    old_class.html(new_class.val()+s);
                    new_class.val("");
                }
            });
        }
    });
    $(".modify_num").click(function()
    {
        var id=$(this).parent().parent().parent().attr("user_id");
        var old_num=$(this).parent().parent().parent().parent().find(".modify_num_confirm").parent();
        var new_num=$(this).prev();
        var user_class=$(this).parent().parent().parent().parent().find(".modify_class_confirm").parent().text().replace("修改","");
        var name=$(this).parent().parent().parent().parent().find(".modify_name_confirm").parent().text().replace("修改","");
        var alert_num=$(this).parent();
        if(/^\d{2}$/.test(new_num.val()))
        {
            $.post("/admin",{modify_num:"yes",user_class:user_class,new_num:new_num.val(),name:name,user_id:id},function(data)
            {
                if(data=="modify num success")
                {
                    alert_num.toggle();
                    s='<button type="button" class="btn btn-xs btn-default modify_num_confirm" style="float:right;">修改</button></td>';
                    old_num.html(new_num.val()+s);
                    new_num.val("");
                }
            });
        }
    });
    $(".modify_name").click(function()
    {
        var id=$(this).parent().parent().parent().attr("user_id");
        var old_name=$(this).parent().parent().parent().parent().find(".modify_name_confirm").parent();
        var new_name=$(this).prev();
        var num=$(this).parent().parent().parent().parent().find(".modify_num_confirm").parent().text().replace("修改","");
        var user_class=$(this).parent().parent().parent().parent().find(".modify_class_confirm").parent().text().replace("修改","");
        var alert_name=$(this).parent();
        if(new_name.val()!='')
        {
            $.post("/admin",{modify_name:"yes",user_class:user_class,num:num,new_name:new_name.val(),user_id:id},function(data)
            {
                if(data=="modify name success")
                {
                    alert_name.toggle();
                    s='<button type="button" class="btn btn-xs btn-default modify_name_confirm" style="float:right;">修改</button></td>';
                    old_name.html(new_name.val()+s);
                    new_name.val("");
                }
            });
        }
    });

    $(".new_question").click(function()
    {
        var question=$(this).parent().parent().find("[name='question']");
        var answer=$(this).parent().parent().find("[name='answer']");
        var tr=$(this).parent().parent();
        $.post("/admin",{new_question:"yes",question:question.val(),answer:answer.val()},function(data)
        {
            var s="";
            if(data=="new question success")
            {
                
                s='<tr><td>'+question.val()+'</td><td>'+answer.val()+'</td><td><button type="button" class="btn btn-default delete_question">删除</button></td></tr>'
                question.val("");
                answer.val("");
                tr.before(s);
                tr.prev().show();
            }
        });
    });
    $(document).on("click",".delete_question",function()
    {
        var question=$(this).parent().parent().find("td:first").text();
        var tr=$(this).parent().parent();
        $.post("/admin",{delete_question:"yes",question:question},function(data)
        {
            if(data=="delete question success")
            {
                tr.remove();
            }
        });
    });

    $(".new_class").click(function()
    {
        var regist_class=$(this).parent().parent().find("[name='class']");
        var tr=$(this).parent().parent();
        $.post("/admin",{new_class:"yes",class:regist_class.val()},function(data)
        {
            var s="";
            if(data=="new class success")
            {
                
                s='<tr><td>'+regist_class.val()+'</td><td><button type="button" class="btn btn-default delete_class">删除</button></td></tr>'
                regist_class.val("");
                tr.before(s);
                tr.prev().show();
            }
        });
    });
    $(document).on("click",".delete_class",function()
    {
        var regist_class=$(this).parent().parent().find("td:first").text();
        var tr=$(this).parent().parent();
        $.post("/admin",{delete_class:"yes",class:regist_class},function(data)
        {
            if(data=="delete class success")
            {
                tr.remove();
            }
        });
    });

    $(".delete_class_user").click(function()
    {
        var user_class_list = $(".user_class").find("li");
        for(var i=0;i<user_class_list.length;i++)
        {
            if($(user_class_list[i]).hasClass('active'))
            {
                var user_class = $(user_class_list[i]).attr("user_class");
                var li = $(user_class_list[i]);
                break;
            }
        }
        $.post('/admin',{delete_class_user:"yes",class:user_class},function(data)
        {
            if(data=="delete class user success")
            {
                $("#class_"+user_class).remove();
                $(li).remove();
            }
        })
    });
});
