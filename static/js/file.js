$(document).ready(function()
{
    $(".delete_file").click(function()
    {
        var file_name=$(this).parent().find("a:first").text();
        var file_tr=$(this).parent().parent();
        $.post("/file",{delete_file:"yes",file_name:file_name},function(data,status)
        {
            if(data=="delete file success")
            {
                file_tr.remove();
                $('.total_help').text('');
            }
        });
    });

    $(".teacher_upload").click(function()
    {
        if($(this).prev().val()!='')
        {
            $(this).parent().submit();
        }
    });

    var schedule;
    var current_course;
    $.get("/file",{schedule:'yes'},function(data)
    {
        schedule=data;
        var s1="";
        var s2="";
        for(var i=0;i<schedule['course'].length;i++)
        {
            if(i==0)
            {
                s1='<option value="'+schedule['course'][i]+'">'+schedule['course'][i]+'</option>';
                s2='<option value="'+schedule['week'][i]+'">第'+schedule['week'][i]+'周</option>';
            };
            if(i>0 && schedule['course'][i]!=schedule['course'][i-1]){s1+='<option value="'+schedule['course'][i]+'">'+schedule['course'][i]+'</option>'};
            if(i>0 && schedule['course'][i]==schedule['course'][0]){s2+='<option value="'+schedule['week'][i]+'">第'+schedule['week'][i]+'周</option>'};
        };
        $(".course_select").html(s1);
        $(".week_select").html(s2);
        current_course=schedule['course_id'][0];
        $("."+current_course+"_work").show();
        $("[name='week']").val(schedule['week'][0]);
        $(".name_help").find("strong").text(schedule['homework'][0]);
        if(schedule['week'].length==0)
        {
            $(".help-block").text("");
            $(".week_help").html("本周没有安排作业");
        }
    },
    "json")

    $(".course_select").change(function()
    {
        var s="";
        var k=1;
        for(var i=0;i<schedule['course'].length;i++)
        {
            if(schedule['course'][i]==$(this).val())
            {
                if(k==1)
                {
                    $(".name_help").find("strong").text(schedule['homework'][i]);
                    k=0;
                }
                s+='<option value="'+schedule['week'][i]+'">第'+schedule['week'][i]+'周</option>';
                $("."+current_course+"_work").hide();
                current_course=schedule['course_id'][i];
                $("."+current_course+"_work").show();
            };
        };
        $(".week_select").html(s);
    });
    $(".week_select").change(function()
    {
        for(var i=0;i<schedule['course'].length;i++)
        {
            if(schedule['course'][i]==$(".course_select").val()&&schedule['week'][i]==$(".week_select").val())
            {
                $(".name_help").find("strong").text(schedule['homework'][i]);
            }
        }
    });

    $(".push_homework").click(function()
    {
        $("[name='homework_name']").val($(".name_help").find("strong").text());
        if($("[name='homework']").val()!='')
        {
            $("#homework_submit").submit();
        }
    });

    $.post("/file",{request:"yes",path:""},function(data)
    {
        var s="";
        for(var i=0;i<data["dir"].length;i++)
        {
            s+='<option value="'+data["dir"][i]+'">'+data["dir"][i]+'</option>';
        }
        $(".file_course_select").html(s);
        $.post("/file",{request:"yes",path:$(".file_course_select").val()+'/'},function(data)
        {
            var s="";
            for(var i=data["dir"].length-1;i>=0;i--)
            {
                s+='<option value="'+data["dir"][i]+'">第'+data["dir"][i]+'周作业</option>';
            }
            $(".file_week_select").html(s);
        }
        ,"json");
    }
    ,"json")

    $(".file_course_select").click(function()
    {
        $.post("/file",{request:"yes",path:$(".file_course_select").val()+'/'},function(data)
        {
            var s="";
            for(var i=data["dir"].length-1;i>=0;i--)
            {
                s+='<option value="'+data["dir"][i]+'">第'+data["dir"][i]+'周作业</option>';
            }
            $(".file_week_select").html(s);
        }
        ,"json")
    });

    $(".file_week_select").click(function()
    {
        $.post("/file",{request:"yes",path:$(".file_course_select").val()+'/'+$(".file_week_select").val()+'/'},function(data)
        {
            var s="";
            for(var i=0;i<data["dir"].length;i++)
            {
                s+='<option value="'+data["dir"][i]+'">'+data["dir"][i]+'班</option>';
            }
            $(".file_class_select").html(s);     
        }
        ,"json")
        $.post("/file",{request:"yes",path:$(".file_course_select").val()+'/'+$(".file_week_select").val()+'/'+$(".file_class_select").val()+"/"},function(data)
        {
            var old_file=$(".file_download").parent().parent().parent().find(".file_name");
            for(var i=0;i<old_file.length;i++)
            {
                $(old_file[i]).remove();
            }
            var old_todo_file=$(".file_download").parent().parent().parent().find(".todo_file_name");
            for(var i=0;i<old_todo_file.length;i++)
            {
                $(old_todo_file[i]).remove();
            }
            var s1="";
            var s2="";
            var k=0;
            for(var i=0;i<data["file_total"]["filename"].length;i++)
            {
                if(data["file_total"]["flag"][i]=="do")
                {
                    if(data["file_total"]['score'][i]==null){t=''}
                    else{t=data["file_total"]['score'][i]}
                    s1+='<tr class="file_name filename" num="'+data["file_total"]['num'][i]+'" style="display:none;">\
                            <td><a href="/static/file/homework/'+$(".file_course_select").val()+'/'+$(".file_week_select").val()+'/'+$(".file_class_select").val()+"/"+data["file_total"]["filename"][i]+'">'+data["file_total"]["filename"][i]+'</a>\
                            </td>\
                            <td><span class="text-primary"><strong class="score">'+t+'</strong></span>\</td>\
                            <td>'+data["file_total"]["push_total"][i]+'次</td>\
                            <td style="position:relative;">'+data["file_total"]["time"][i]+'<button class="btn btn-xs btn-default delete_homework_confirm" style="float:right;">删除</button>\
                                <button type="button" class="btn btn-xs btn-info score_homework_confirm" style="margin-right:3px;float:right;">评分</button>\
                                <div class="alert alert-info alert_score_homework" role="alert" style="position:absolute;top:-3px;right:85px;z-index:99;padding:5px 5px 5px 10px;width:50%;display:none;">\
                                  <input type="text" class="form-control" style="float:left;display:inline;width:70%;"/>\
                                  <button type="button" class="btn btn-info btn-sm score_homework" style="margin:2px 0px 0px 3px;float:left;display:inline;">确定</button>\
                                </div>\
                                <div class="alert alert-danger alert_delete_homework" role="alert" style="position:absolute;top:0px;right:45px;z-index:99;padding:5px 10px 5px 10px;width:35%;display:none;">确定删除？\
                                  <button type="button" class="btn btn-danger btn-xs delete_homework" style="float:right;display:inline;">确定</button>\
                                </div>\
                            </td>\
                        </tr>';
                    k++;
                }
                else
                {
                    s2+='<tr class="todo_file_name filename" num="'+data["file_total"]['num'][i]+'" style="display:none;"><td>'+data["file_total"]["filename"][i]+'</td><td><strong>0</strong></td><td>0次</td><td>未交</td></tr>';
                }
            }
            $(".file_download").parent().parent().before(s1);
            $(".file_name").show(1000);
            $(".file_download").parent().parent().before(s2);
            $(".todo_file_name").show(1000);            
            $(".total_help").html("本班注册人数:"+data["class_total"]+"人&nbsp;&nbsp;已交:<strong>"+k+"</strong>人&nbsp;");
        }
        ,"json")
    });

    $(".file_class_select").click(function()
    {
        $.post("/file",{request:"yes",path:$(".file_course_select").val()+'/'+$(".file_week_select").val()+'/'+$(".file_class_select").val()+"/"},function(data)
        {
            var old_file=$(".file_download").parent().parent().parent().find(".file_name");
            for(var i=0;i<old_file.length;i++)
            {
                $(old_file[i]).remove();
            }
            var old_todo_file=$(".file_download").parent().parent().parent().find(".todo_file_name");
            for(var i=0;i<old_todo_file.length;i++)
            {
                $(old_todo_file[i]).remove();
            }
            var s1="";
            var s2="";
            var k=0;
            for(var i=0;i<data["file_total"]["filename"].length;i++)
            {
                if(data["file_total"]["flag"][i]=="do")
                {
                    if(data["file_total"]['score'][i]==null){t=''}
                    else{t=data["file_total"]['score'][i]}
                    s1+='<tr class="file_name filename" num="'+data["file_total"]['num'][i]+'" style="display:none;">\
                            <td><a href="/static/file/homework/'+$(".file_course_select").val()+'/'+$(".file_week_select").val()+'/'+$(".file_class_select").val()+"/"+data["file_total"]["filename"][i]+'">'+data["file_total"]["filename"][i]+'</a>\
                            </td>\
                            <td><span class="text-primary"><strong class="score">'+t+'</strong></span>\</td>\
                            <td>'+data["file_total"]['push_total'][i]+'次</td>\
                            <td style="position:relative;">'+data["file_total"]["time"][i]+'<button class="btn btn-xs btn-default delete_homework_confirm" style="float:right;">删除</button>\
                                <button type="button" class="btn btn-xs btn-info score_homework_confirm" style="margin-right:3px;float:right;">评分</button>\
                                <div class="alert alert-info alert_score_homework" role="alert" style="position:absolute;top:-3px;right:85px;z-index:99;padding:5px 5px 5px 10px;width:50%;display:none;">\
                                  <input type="text" class="form-control" style="float:left;display:inline;width:70%;"/>\
                                  <button type="button" class="btn btn-info btn-sm score_homework" style="margin:2px 0px 0px 3px;float:left;display:inline;">确定</button>\
                                </div>\
                                <div class="alert alert-danger alert_delete_homework" role="alert" style="position:absolute;top:0px;right:45px;z-index:99;padding:5px 10px 5px 10px;width:35%;display:none;">确定删除？\
                                  <button type="button" class="btn btn-danger btn-xs delete_homework" style="float:right;display:inline;">确定</button>\
                                </div>\
                            </td>\
                        </tr>';
                    k++;
                }
                else
                {
                    s2+='<tr class="todo_file_name filename" num="'+data["file_total"]['num'][i]+'" style="display:none;"><td>'+data["file_total"]["filename"][i]+'</td><td><strong>0</strong></td><td>0次</td><td>未交</td></tr>';
                }
            }
            $(".file_download").parent().parent().before(s1);
            $(".file_name").show(1000);
            $(".file_download").parent().parent().before(s2);
            $(".todo_file_name").show(1000);   
            $(".total_help").html("本班注册人数:"+data["class_total"]+"人&nbsp;&nbsp;已交:<strong>"+k+"</strong>人&nbsp;");
            $
        }
        ,"json")
    });

    $(".file_download").click(function()
    {
        $.post("/file",{download:"yes",course:$(".file_course_select").val(),week:$(".file_week_select").val(),class:$(".file_class_select").val()},function(data)
        {
            if(data=="files is compress sucess")
            {
                window.open('/static/temp/'+$(".file_course_select").val()+'_第'+$(".file_week_select").val()+'周_'+$(".file_class_select").val()+'班.tar.gz');
            }
        });
    });

    $(document).on("click",".delete_homework_confirm",function(){$(this).parent().find(".alert_delete_homework").toggle()});
    $(document).on("click",".score_homework_confirm",function(){$(this).parent().find(".alert_score_homework").toggle()});

    $(document).on("click",".delete_homework",function()
    {
        var course=$(".file_course_select").val();
        var week=$(".file_week_select").val();
        var user_class=$(".file_class_select").val();
        var filename=$(this).parent().parent().parent().find("td:first").text();
        var tr=$(this).parent().parent().parent();
        $.post("/file",{delete_homework:"yes",course:course,week:week,class:user_class,filename:filename},function(data)
        {
            if(data=="delete homework success")
            {
                tr.remove();
            }
        });
    });
    $(document).on("click",".score_homework",function()
    {
        var score=$(this).prev();
        var old_score=$(this).parent().parent().parent().find(".score");
        var filename=$(this).parent().parent().parent().find("td:first").text();
        var confirm=$(this).parent();
        if(score.val()>=0 && score.val()<=100)
        {
            $.post("/file",{score_homework:"yes",score:score.val(),filename:filename},function(data)
            {
                if(data=="score homework success")
                {
                    old_score.text(score.val());
                    score.val("");
                    confirm.hide();
                }
            });
        }
        else
        {
            $(this).prev().val("");
        }
    });

    $('.delete_directory').click(function()
    {
        if($(".file_course_select").val())
        {   
            if($(".file_week_select").val())
            {   
                if($(".file_class_select").val())
                {
                    var path=$(".file_course_select").val()+'/'+$(".file_week_select").val()+'/'+$(".file_class_select").val();
                    var selector=$(".file_class_select");
                    var deleteor=$(".file_class_select").val();
                }
                else
                {
                    var path=$(".file_course_select").val()+'/'+$(".file_week_select").val();
                    var selector=$(".file_week_select");
                    var deleteor=$(".file_week_select").val();
                }
            }
            else
            {
                var path=$(".file_course_select").val();
                var selector=$(".file_course_select");
                var deleteor=$(".file_course_select").val();
            }
        }
        else
        {var path='nothing';}
        $.post('/file',{delete_directory:"yes",path:path},function(data)
        {
            if(data="delete directory success")
            {
                $('.filename').remove();
                var option=selector.find("option");
                for(var i=0;i<option.length;i++)
                {
                    if($(option[i]).attr('value')==deleteor)
                    {
                        $(option[i]).remove();
                    }
                }
            }
        });
    });

    var sort_filename_flag=0;
    $(".sort_filename").click(function()
    {
        if(sort_filename_flag==1)
        {
            var file_sort_filename=$(".filename").toArray().sort(function(a,b)
            {
                return parseInt($(a).attr("num")) > parseInt($(b).attr("num"));
            });
            var oldfile=$(".file_download").parent().parent().parent().find(".filename");
            for(var i=0;i<oldfile.length;i++)
            {
                $(oldfile[i]).remove();
            }
            $(".sort_filename").parent().after(file_sort_filename);
            sort_filename_flag=0;
        }
        else
        {
            var file_sort_filename=$(".filename").toArray().sort(function(a,b)
            {
                return parseInt($(a).attr("num")) < parseInt($(b).attr("num"));
            });
            var oldfile=$(".file_download").parent().parent().parent().find(".filename");
            for(var i=0;i<oldfile.length;i++)
            {
                $(oldfile[i]).remove();
            }
            $(".sort_filename").parent().after(file_sort_filename);
            sort_filename_flag=1;
        }
    });

    var sort_time_flag=0;
    $(".sort_time").click(function()
    {
        if(sort_time_flag==1)
        {
            var file_sort_time=$(".file_name").toArray().sort(function(a,b)
            {
                return $(a).find("td:last").text() > $(b).find("td:last").text();
            });
            var old_file=$(".file_download").parent().parent().parent().find(".file_name");
            for(var i=0;i<old_file.length;i++)
            {
                $(old_file[i]).remove();
            }
            $(".sort_time").parent().after(file_sort_time);
            sort_time_flag=0;
        }
        else
        {
            var file_sort_time=$(".file_name").toArray().sort(function(a,b)
            {
                return $(a).find("td:last").text() < $(b).find("td:last").text();
            });
            var old_file=$(".file_download").parent().parent().parent().find(".file_name");
            for(var i=0;i<old_file.length;i++)
            {
                $(old_file[i]).remove();
            }
            $(".sort_time").parent().after(file_sort_time);
            sort_time_flag=1;
        }
    });

    var sort_score_flag=0;
    $(".sort_score").click(function()
    {
        if(sort_score_flag==1)
        {
            var file_sort_score=$(".file_name").toArray().sort(function(a,b)
            {
                return parseInt($(a).find(".score").text()) > parseInt($(b).find(".score").text());
            });
            var old_file=$(".file_download").parent().parent().parent().find(".file_name");
            for(var i=0;i<old_file.length;i++)
            {
                $(old_file[i]).remove();
            }
            $(".sort_score").parent().after(file_sort_score);
            sort_score_flag=0;
        }
        else
        {
            var file_sort_score=$(".file_name").toArray().sort(function(a,b)
            {
                return parseInt($(a).find(".score").text()) < parseInt($(b).find(".score").text());
            });
            var old_file=$(".file_download").parent().parent().parent().find(".file_name");
            for(var i=0;i<old_file.length;i++)
            {
                $(old_file[i]).remove();
            }
            $(".sort_score").parent().after(file_sort_score);
            sort_score_flag=1;
        }
    });
});
