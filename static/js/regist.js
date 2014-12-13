$(document).ready(function()
{
    answer_stat='false';
    account_stat='false';
    passwd_stat='false';
    name_stat='false';
    class_stat='false';
    num_stat='false';
    $("form").change(function()
    {
        for(var i=0;i<$(".question").length;i++)
        {
            if($($(".question")[i]).find("[type='text']").val()=='')
            {
                $($(".question")[i]).addClass("has-error");
                $($(".question")[i]).removeClass("has-success");
                $($(".question")[i]).find("span:last").removeClass("glyphicon-ok");
                $($(".question")[i]).find("span:last").addClass("glyphicon-remove");
                answer_stat='false';
            }
            else
            {
                $($(".question")[i]).addClass("has-success");
                $($(".question")[i]).removeClass("has-error");
                $($(".question")[i]).find("span:last").removeClass("glyphicon-remove");
                $($(".question")[i]).find("span:last").addClass("glyphicon-ok");
                answer_stat='true';
            }
        };
        if ($("#user_account").val() == '') {
            $("#account_help").text("用户名不能为空");
            $("#user_account").focus();
            $("#user_account").parent().removeClass("has-warning");
            $("#user_account").parent().removeClass("has-success");
            $("#user_account").parent().addClass("has-error");
            $("#user_account").next().removeClass("glyphicon-ok");
            $("#user_account").next().removeClass("glyphicon-warning-sign");
            $("#user_account").next().addClass("glyphicon-remove");
            account_stat='false';
        }
        else {
            if ($("#user_account").val().length < 3)
            {
                $("#account_help").text("用户名至少大于两个字符");
                $("#user_account").focus();
                $("#user_account").parent().removeClass("has-error");
                $("#user_account").parent().removeClass("has-success");
                $("#user_account").parent().addClass("has-warning");
                $("#user_account").next().removeClass("glyphicon-remove");
                $("#user_account").next().removeClass("glyphicon-ok");
                $("#user_account").next().addClass("glyphicon-warning-sign");
                account_stat='false';
            }
            else 
            {
                $.get('regist?request="'+$("#user_account").val()+'"',function(data,status)
                {
                    if(data=="the user no exist.")
                    {
                        $("#account_help").text('');
                        $("#user_account").parent().removeClass("has-error");
                        $("#user_account").parent().removeClass("has-warning");
                        $("#user_account").parent().addClass("has-success");
                        $("#user_account").next().removeClass("glyphicon-remove");
                        $("#user_account").next().removeClass("glyphicon-warning-sign");
                        $("#user_account").next().addClass("glyphicon-ok");
                        account_stat='true';
                    }
                    else
                    {
                        $("#account_help").text('该用户名已被注册！');
                        $("#user_account").focus();
                        $("#user_account").parent().removeClass("has-warning");
                        $("#user_account").parent().removeClass("has-success");
                        $("#user_account").parent().addClass("has-error");
                        $("#user_account").next().removeClass("glyphicon-ok");
                        $("#user_account").next().removeClass("glyphicon-warning-sign");
                        $("#user_account").next().addClass("glyphicon-remove");
                        account_stat='false';
                    }
                });
            }
        };
        if ($("#user_passwd").val() == '')
        {
            $("#passwd_help").text("密码不能为空");
            $("#user_passwd").focus();
            $("#user_passwd").parent().removeClass("has-warning");
            $("#user_passwd").parent().removeClass("has-success");
            $("#user_passwd").parent().addClass("has-error");
            $("#user_passwd").next().removeClass("glyphicon-ok");
            $("#user_passwd").next().removeClass("glyphicon-warning-sign");
            $("#user_passwd").next().addClass("glyphicon-remove");
            passwd_stat='false';
        }
        else
        {
            if($("#user_passwd").val().length <= 6)
            {
                $("#passwd_help").text("密码应大于6个字符");
                $("#user_passwd").focus();
                $("#user_passwd").parent().removeClass("has-error");
                $("#user_passwd").parent().removeClass("has-success");
                $("#user_passwd").parent().addClass("has-warning");
                $("#user_passwd").next().removeClass("glyphicon-ok");
                $("#user_passwd").next().removeClass("glyphicon-remove");
                $("#user_passwd").next().addClass("glyphicon-warning-sign");
                passwd_stat='false';
            }
            else
            {
                $("#passwd_help").text("");
                $("#user_passwd").focus();
                $("#user_passwd").parent().removeClass("has-error");
                $("#user_passwd").parent().removeClass("has-warning");
                $("#user_passwd").parent().addClass("has-success");
                $("#user_passwd").next().removeClass("glyphicon-warning-sign");
                $("#user_passwd").next().removeClass("glyphicon-remove");
                $("#user_passwd").next().addClass("glyphicon-ok");
                passwd_stat='true';
            }
        };
        if(passwd_stat=='true')
        {
            if($("#user_name").val() == '')
            {
                $("#name_help").text("姓名不能为空");
                $("#user_name").focus();
                $("#user_name").parent().removeClass("has-warning");
                $("#user_name").parent().removeClass("has-success");
                $("#user_name").parent().addClass("has-error");
                $("#user_name").next().removeClass("glyphicon-ok");
                $("#user_name").next().removeClass("glyphicon-warning-sign");
                $("#user_name").next().addClass("glyphicon-remove");
                name_stat='false';
            }
            else
            {
                $("#name_help").text("");
                $("#user_name").focus();
                $("#user_name").parent().removeClass("has-warning");
                $("#user_name").parent().removeClass("has-error");
                $("#user_name").parent().addClass("has-success");
                $("#user_name").next().removeClass("glyphicon-remove");
                $("#user_name").next().removeClass("glyphicon-warning-sign");
                $("#user_name").next().addClass("glyphicon-ok");
                name_stat='true';
            }
        };
        if(name_stat=='true')
        {
        	if($("#class_name").val() == '' || $("#class_name").val() == null)
        	{
        		$("#class_name").focus();
                $("#class_name").parent().removeClass("has-warning");
                $("#class_name").parent().removeClass("has-success");
                $("#class_name").parent().addClass("has-error");
                $("#class_name").next().removeClass("glyphicon-ok");
                $("#class_name").next().removeClass("glyphicon-warning-sign");
                $("#class_name").next().addClass("glyphicon-remove");
                class_stat='false';
        	}
        	else
        	{
        		$("#class_name").focus();
                $("#class_name").parent().removeClass("has-warning");
                $("#class_name").parent().removeClass("has-error");
                $("#class_name").parent().addClass("has-success");
                $("#class_name").next().removeClass("glyphicon-remove");
                $("#class_name").next().removeClass("glyphicon-warning-sign");
                $("#class_name").next().addClass("glyphicon-ok");
                class_stat='true';
        	}
        };
        if(class_stat=='true')
        {
            if($("#user_num").val() == '')
            {
                $("#user_num").text("学号不能为空");
                $("#user_num").focus();
                $("#user_num").parent().removeClass("has-warning");
                $("#user_num").parent().removeClass("has-success");
                $("#user_num").parent().addClass("has-error");
                $("#user_num").next().removeClass("glyphicon-ok");
                $("#user_num").next().removeClass("glyphicon-warning-sign");
                $("#user_num").next().addClass("glyphicon-remove");
                num_stat='false';
            }
            else
            {
                if(/^\d{2}$/.test($("#user_num").val()) == false)
                {
                    $("#num_help").text("请输入学号的后两位数字");
                    $("#user_num").focus();
                    $("#user_num").parent().removeClass("has-error");
                    $("#user_num").parent().removeClass("has-success");
                    $("#user_num").parent().addClass("has-warning");
                    $("#user_num").next().removeClass("glyphicon-ok");
                    $("#user_num").next().removeClass("glyphicon-remove");
                    $("#user_num").next().addClass("glyphicon-warning-sign");
                    num_stat='false';
                }
                else
                {
                    $.get('regist?request_class="'+$("#class_name").val()+'"&request_num="'+$("#user_num").val()+'"',function(data,status)
                    {
                        if(data=="the user no exist.")
                        {
                            $("#num_help").text("");
                            $("#user_num").focus();
                            $("#user_num").parent().removeClass("has-warning");
                            $("#user_num").parent().removeClass("has-error");
                            $("#user_num").parent().addClass("has-success");
                            $("#user_num").next().removeClass("glyphicon-remove");
                            $("#user_num").next().removeClass("glyphicon-warning-sign");
                            $("#user_num").next().addClass("glyphicon-ok");
                            num_stat='true';
                        }
                        else
                        {
                            $("#num_help").text("该学生信息已被注册");
                            $("#user_num").focus();
                            $("#user_num").parent().removeClass("has-success");
                            $("#user_num").parent().removeClass("has-error");
                            $("#user_num").parent().addClass("has-warning");
                            $("#user_num").next().removeClass("glyphicon-remove");
                            $("#user_num").next().removeClass("glyphicon-ok");
                            $("#user_num").next().addClass("glyphicon-warning-sign");
                            num_stat='false';
                        }
                    });
                }
            }
        };
    });
    $("button").click(function()
    {
        if(answer_stat=='true'&&account_stat=='true'&&passwd_stat=='true'&&name_stat=='true'&&class_stat=='true'&&num_stat=='true')
        {
            var filepath=$("#user_photo").val();
            if(filepath == ''){
                    tmp=$("#user_passwd").val();
                    $("#user_passwd").val(hex_md5(tmp));
                    $("#default").val(1);
                    $("form").submit();
                }
            var extStart=filepath.lastIndexOf(".");
            var ext=filepath.substring(extStart,filepath.length).toUpperCase();
            if(ext!=".BMP"&&ext!=".PNG"&&ext!=".GIF"&&ext!=".JPG"&&ext!=".JPEG"){
                $("#photo_help").text("图片格式仅限于bmp,png,gif,jpeg,jpg");
                return false;
            }
            var img=new Image();
            img.src=filepath;
            if(img.fileSize >= 500*1024){
                $("#photo_help").text("图片应小于1M");
                return false;
            }
            tmp=$("#user_passwd").val();
            $("#user_passwd").val(hex_md5(tmp));
            $("form").submit();
        }
    });
    if($(".progress-bar").length > 0){
        var i=0
        function pro(){
            $(".progress-bar").css({'width':i+'%'})
            i+=10
            if(i>=100) window.location.replace("/index");
        }
        for(j=0;j<=10;j++)
        {
            setTimeout(function(){pro()},j*500);
            //setTimeout是非阻塞的异步执行方式
            //把回调函数写成匿名函数以兼容火狐浏览器
        }
    }
});

