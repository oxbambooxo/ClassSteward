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

    $("[name='course_class']").focus(function()
    {
        $(this).attr('data-content',"输入课程所属班级,若有多个班级,以半角的逗号相隔开,例如:1221,1222");
        $(this).popover("show");
    });

    $("[name='homework']").focus(function()
    {
        $(this).attr('data-content',"例如: C_lab1_if_else_AA_BB_CC.doc 其中'AA','BB','CC'代表'班级','学号','姓名' 将会被格式化替换.");
        $(this).popover("show");
    });

    $(".new_course").click(function()
    {
        var check_name=$(this).parent().parent().parent().find(".course_check");
        var new_name=$(this).parent().prev().prev().find("[name='course_name']");
        var new_class=$(this).parent().prev().find("[name='course_class']");
        var new_teacher=$(this).prev();
        var my_td=$(this).parent().parent();
        var new_course_status=1;
        var check=$(this).parent().parent().find(":text");
        for(var i=0;i<check.length;i++)
        {
            if($(check[i]).val()=="")
            {
                new_course_status=0;
                my_td.removeClass("success");
                my_td.addClass("danger");
                setTimeout(function(){my_td.removeClass("danger");},1500);
            }
            else
            {
                $(my_td).removeClass("danger");
                $(my_td).addClass("success");
            }

        }
        for(var i=0;i<=check_name.length;i++)
        {
            if($(check_name[i]).html()!=undefined)
            {
                if($(check_name[i]).html()==new_name.val())
                {
                    new_course_status=0;
                    my_td.removeClass("success");
                    my_td.addClass("danger");
                    setTimeout(function(){my_td.removeClass("danger");},1500);
                }
            }
        }
        if(new_course_status==1)
        {
            $.post("/schedule",{new_course:"yes",course_name:new_name.val(),course_class:new_class.val(),course_teacher:new_teacher.val()},function(data,status)
            {
                if(data=="new course success")
                {
                    s='<tr>\
                    <td class="course_check">'+new_name.val()+'</td>\
                    <td>'+new_class.val()+'</td>\
                    <td><input type="button" class="btn btn-default delete_course" value="删除" style="float:right;" />'+new_teacher.val()+'</td>\
                    </tr>\
                    ';
                    my_td.before(s);
                    new_name.val("");
                    new_class.val("");
                    new_teacher.val("");
                }
            });
        }
    });
    
    $(document).on("click",".delete_course",function()
    {
        $(this).addClass('confirm_delete_course');
        $(this).addClass('btn-danger');
        $(this).val("确定");
        btn = $(this);
        setTimeout(function(){btn.removeClass("confirm_delete_course btn-danger");btn.val("删除");},1500);
    });

    $(document).on("click",".confirm_delete_course",function()
    {
        var course_name=$(this).parent().prev().prev().text();
        var my_td=$(this).parent().parent();
        $.post("/schedule",{delete_course:"yes",course_name:course_name},function(data,status)
        {
            if(data=="delete course success")
            {
                my_td.remove();
                schedule_tabs=$("#course_schedule ul.nav.nav-tabs").find("li a");
                for(var i=0;i<schedule_tabs.length;i++)
                {
                    if($(schedule_tabs[i]).html()==course_name)
                    {
                        $(schedule_tabs[i]).remove();
                    }
                }
                schedule_contents=$("#course_schedule div.tab-content div.table-responsive")
                for(var i=0;i<schedule_contents.length;i++)
                {
                    if($(schedule_contents[i]).attr("course")==course_name)
                    {
                        $(schedule_contents[i]).remove();
                    }
                }
            }
        });
    });
    
    $(document).on("click",".hide_course",function()
    {
        var course_name=$(this).parent().prev().prev().text();
        console.log(course_name);
        $.post("/schedule",{hide_course:"yes",course_name:course_name},function(data,status)
        {
            if(data=="hide course success")
            {
                location=location;
            }
        });
    });

    $(document).on("click",".show_course",function()
    {
        var course_name=$(this).parent().prev().prev().text();
        $.post("/schedule",{show_course:"yes",course_name:course_name},function(data,status)
        {
            if(data=="show course success")
            {
                location=location;
            }
        });
    });

    var list=$("#class_list").find("option");
    for(var i=0;i<list.length;i++)
    {
        var t=$(list[i]).val();
        var flag=true;
        for(var j=0;j<list.length;j++)
        {
            if($(list[j]).val()==t)
            {
                if(flag==true){ flag=false; }
                else{ $(list[j]).remove(); }
            }
        };
    };

    $("[name='schedule_week']").html(function()
    {
        var week_id=$(this).parent().parent().parent().parent().find(".week_id");
        var s=""
        for(var i=1;i<=25;i++)
        {
            var k=1;
            for(var j=0;j<week_id.length;j++)
            {
                if($(week_id[j]).attr("week") == i) k=0;
            }
            if(k==1) s+='<option value="'+i+'">第'+i+'周</option>';
        }
        return s;
    });

    $("[name='date_start']").val(function()
    {
        var today=new Date()
        var n=today.getFullYear()
        var y=today.getMonth()+1
        var d=today.getDate()
        if(y<10){y="0"+y}
        var date=n+"-"+y+"-"+d
        return date;
    });
    $("[name='date_end']").val($("[name='date_start']").val());
    $("[name='homework_start']").val($("[name='date_start']").val());
    $("[name='homework_end']").val($("[name='date_start']").val());

    if($('.select_date').length>0)
    {
        $('.select_date').mouseenter(function()
        {
            $(this).datetimepicker({
                language:'zh-CN',
                format:'yyyy-mm-dd hh:ii:ss',
                weekStart: 0,
                todayBtn:  0,
                autoclose: 1,
                todayHighlight: 0,
                startView: 2,
                minView: 0,
                forceParse: 1
            });
        });
    }

    $(".new_schedule").click(function()
    {
        var form=$(this).parent().parent().parent().parent().parent().parent().find(".new_schedule_submit");
        var edit=$("#editor");
        $(this).parent().prev().find("input").val(edit.html());
        form.removeClass("danger");
        form.addClass("success");
        form.submit();
    });

    $(".cancel_submit").click(function(){$("#editor").html("")});

    $(".delete_schedule").click(function()
    {
        var name=$(this).parent().parent().parent().parent().parent().attr("course");
        var week=$(this).parent().parent().find("td:first").attr("week");
        var schedule=$(this).parent().parent();
        var week_select=$(this).parent().parent().parent().find("[name='schedule_week']");
        $.post("/schedule",{delete_schedule:"yes",course_name:name,week:week},function(data,status)
        {
            if(data=="delete schedule success")
            {
                s='<option value="'+week+'">第'+week+'周</option>';
                week_select.html(week_select.html()+s);
                week_select.val(week);
                schedule.remove();
            }
        });
    });

    $("[name='event']").click(function()
    {
        $(".schedule_confirm").text("确定");
    });
    var modify_schedule_course;
    var modify_schedule_week;
    var modify_schedule_tr;
    $(".modify_schedule_event").click(function()
    {
        $("#schedule_course").modal();
        $(".schedule_confirm").text("修改");
        $("#editor").html($(this).prev().html());
        modify_schedule_course=$(this).parent().parent().parent().parent().parent().attr("course");
        modify_schedule_week=$(this).parent().parent().find("td:first").attr("week");
        modify_schedule_tr=$(this).parent().parent();
    });
    $(".schedule_confirm").click(function()
    {
        if($(this).text()=="修改"&&$("#editor").html()!='')
        {
            $.post('/schedule',{modify_schedule_event:"yes",event:$("#editor").html(),course:modify_schedule_course,week:modify_schedule_week},function(data)
            {
                if(data=="modify event success")
                {
                    modify_schedule_tr.find(".schedule_event").html($("#editor").html());
                    $("#editor").html("");
                }
            });
        }
    });

    $(".modify_schedule_date").click(function()
    {
        if($(this).text()=="修改")
        {
            $(this).prev().toggle();
            $(this).text("确定");
            $(this).next().toggle();
        }
        else
        {
            var date_start=$(this).prev().find("input:first").val();
            var date_end=$(this).prev().find("input:last").val();
            var course=$(this).parent().parent().parent().parent().parent().attr("course");
            var week=$(this).parent().parent().find("td:first").attr("week");
            var btn=$(this);
            if(date_start!=''&&date_end!='')
            {
                $.post("/schedule",{modify_schedule_date:"yes",date_start:date_start,date_end:date_end,course:course,week:week},function(data)
                {
                    if(data=="modify date success")
                    {
                        btn.parent().find("span:first").html(date_start+" 到 "+date_end);
                        btn.text("修改");
                        btn.prev().hide();
                        btn.next().hide();
                    }
                });
            }
        }
    });
    $(".cancel_schedule_date").click(function()
    {
        $(this).prev().text("修改");
        $(this).prev().prev().toggle();
        $(this).hide();
    });

    $(".modify_schedule_homework").click(function()
    {
        if($(this).text()=="修改作业命名规范")
        {
            $(this).text("确定");
            $(this).prev().show();
            $(this).next().show();
        }
        else
        {
            if($(this).prev().val()!='')
            {
                var homework=$(this).prev().val();
                var course=$(this).parent().parent().parent().parent().parent().attr("course");
                var week=$(this).parent().parent().find("td:first").attr("week");
                var btn=$(this);
                $.post("/schedule",{modify_schedule_homework:"yes",homework:homework,course:course,week:week},function(data)
                {
                    if(data=="modify homework success")
                    {
                        var t=btn.prev().prev().find("span");
                        if(t.length!=0)
                        {
                            btn.prev().prev().html('<div style="margin:3px 0px 3px 3px;"><span class="glyphicon glyphicon-pencil"></span>&nbsp;'+homework+'<button class="btn btn-danger btn-xs delete_homework" style="float:right;">删除</button></div>');
                        }
                        else
                        {
                            btn.prev().before('<div style="margin:3px 0px 3px 3px;"><span class="glyphicon glyphicon-pencil"></span>&nbsp;'+homework+'<button class="btn btn-danger btn-xs delete_homework" style="float:right;">删除</button></div>');
                        }
                        var homework_start=$(".modify_schedule_homework_date").prev().find("input:first").val();
                        var homework_end=$(".modify_schedule_homework_date").prev().find("input:last").val();
                        if(!btn.next().next().hasClass("homework_date"))
                        {
                            btn.next().after('<div style="margin:3px 0px 3px 3px;" class="homework_date"><span class="glyphicon glyphicon-pencil"></span>&nbsp;'+homework_start+' 到 '+homework_end+'</div>');
                        }
                        btn.prev().hide();
                        btn.next().hide();
                        btn.text("修改作业命名规范");
                    }
                });
            }
        }
    });
    $(".cancel_schedule_homework").click(function()
    {
        $(this).prev().text("修改作业命名规范");
        $(this).prev().prev().hide();
        $(this).hide();
    });

    $(".modify_schedule_homework_date").click(function()
    {
        if($(this).text()=="修改作业截止日期")
        {
            $(this).text("确定");
            $(this).prev().show();
            $(this).next().show();
        }
        else
        {
            var date_start=$(this).prev().find("input:first").val();
            var date_end=$(this).prev().find("input:last").val();
            var course=$(this).parent().parent().parent().parent().parent().attr("course");
            var week=$(this).parent().parent().find("td:first").attr("week");
            var btn=$(this);
            if(date_start!=''&&date_end!='')
            {
                $.post("/schedule",{modify_schedule_homework_date:"yes",homework_start:date_start,homework_end:date_end,course:course,week:week},function(data)
                {
                    if(data=="modify homework_date sucecss")
                    {
                        btn.prev().prev().html('<span class="glyphicon glyphicon-pencil"></span>&nbsp;'+date_start+' 到 '+date_end);
                        btn.prev().hide();
                        btn.next().hide();
                        btn.text('修改作业截止日期');
                    }
                });
            }
        }
    });
    $(".cancel_schedule_homework_date").click(function()
    {
        $(this).prev().prev().hide();
        $(this).prev().text("修改作业截止日期");
        $(this).hide();
    });

    $(".addition_file").click(function()
    {
        $(this).prev().toggle();
        $(this).hide();
    });
    $(".cancel_addition_file").click(function()
    {
        var form=$(this).parent().parent().parent().parent().parent();
        form.next().show();
        form.hide();
    });

    $(".delete_courseware").click(function()
    {
        var courseware=$(this).prev().text();
        var course=$(this).parent().parent().parent().parent().parent().parent().attr("course");
        var week=$(this).parent().parent().parent().find("td:first").attr("week");
        var btn=$(this);
        $.post("/schedule",{delete_courseware:"yes",courseware:courseware,course:course,week:week},function(data)
        {
            if(data=="delete courseware success")
            {
                btn.parent().remove();
            }
        });
    });
    $(".delete_coursework").click(function()
    {
        var coursework=$(this).prev().text();
        var course=$(this).parent().parent().parent().parent().parent().parent().attr("course");
        var week=$(this).parent().parent().parent().find("td:first").attr("week");
        var btn=$(this);
        $.post("/schedule",{delete_coursework:"yes",coursework:coursework,course:course,week:week},function(data)
        {
            if(data=="delete coursework success")
            {
                btn.parent().remove();
            }
        });
    });
    $(document).on("click",".delete_homework",function()
    {
        var course=$(this).parent().parent().parent().parent().parent().parent().attr("course");
        var week=$(this).parent().parent().parent().find("td:first").attr("week");
        var btn=$(this);
        $.post('/schedule',{delete_homework:"yes",course:course,week:week},function(data)
        {
            if(data=="delete homework success")
            {
                var t=btn.parent().next().next().next().next();
                if(t.hasClass("homework_date")) t.remove();
                btn.parent().remove();
            }
        });
    });

    $(".new_syllabus").click(function()
    {
        var course_name=$(this).parent().parent().parent().parent().parent().attr("course");
        var head=$(this).parent().parent().find("[name='syllabus_head']");
        var detail=$(this).prev();
        var tr=$(this).parent().parent();
        detail.val($("#editor").html());
        var state=1;
        if(head.val()=='') state=0;
        if(detail.val()=='') state=0;
        if(state==1)
        {
            tr.removeClass("danger");
            tr.addClass("success");
            $.post("/syllabus",{new_syllabus:"yes",name:course_name,head:head.val(),detail:detail.val()},function(data)
            {
                var s='<tr syllabus="'+data+'"><td width="20%">'+head.val()+'</td><td width="80%">'+detail.val()+'<button type="button" class="btn btn-xs btn-default delete_syllabus" style="float:right;">删除</button></td></tr>';
                tr.before(s);
                tr.prev().show();
                $("#editor").html("");
                head.val("");
                detail.val("");
            });
        }
        else
        {
            tr.removeClass("success");
            tr.addClass("danger");
            detail.val("");
            setTimeout(function(){tr.removeClass("danger");},1500);
        }
    });

    $(document).on("click",".delete_syllabus",function()
    {
        $(this).addClass('confirm_delete_syllabus');
        $(this).addClass('btn-danger');
        $(this).text("确定");
    });

    $(document).on("click",".confirm_delete_syllabus",function()
    {
        var tr=$(this).parent().parent();
        var syllabus_id=$(this).parent().parent().attr("syllabus");
        $.post("/syllabus",{delete_syllabus:"yes",id:syllabus_id},function(data)
        {
            if(data=="delete syllabus success")
            {
                tr.remove();
            }
        });
    });

    if($(".modify_syllabus_head").length>0)
    {
        for(var i=0;i<$(".modify_syllabus_head").length;i++)
        {
            $($(".modify_syllabus_head")[i]).parent().height($($(".modify_syllabus_head")[i]).parent().parent().height());
        };
        $("#course_syllabus_detail ul:first li").click(function()
        {
            setTimeout(function()
            {
                for(var i=0;i<$(".modify_syllabus_head").length;i++)
                {
                    $($(".modify_syllabus_head")[i]).parent().height($($(".modify_syllabus_head")[i]).parent().parent().height());
                }
            },200);
        });
    }

    $(document).on("click",".cancel_syllabus_head",function()
    {
        $(this).prev().text("修改");
        $(this).prev().prev().toggle();
        $(this).remove();
    });
    $(".modify_syllabus_head").click(function()
    {
        if($(this).text()=="修改")
        {
            $(this).prev().toggle();
            $(this).text("确定");
            var s='<button type="button" class="btn btn-xs btn-danger cancel_syllabus_head" style="position:absolute;bottom:0px;left:'+($(this).width()+12)+'px;">取消</button>';
            $(this).after(s);
        }
        else
        {
            if($(this).prev().val()!='')
            {
                var btn=$(this);
                var id=$(this).parent().parent().parent().attr("syllabus");
                var head=$(this).prev().val();
                $.post('/syllabus',{modify_syllabus_head:"yes",head:head,id:id},function(data)
                {
                    if(data=="modify syllabus sucess")
                    {
                        btn.prev().toggle();
                        btn.next().remove();
                        btn.prev().prev().html(head);
                        btn.text("修改");
                    }
                })
            }
        }
    });

    $("[name='syllabus_detail']").click(function()
    {
        $(".syllabus_confirm").text("确定");
    });
    var modify_syllabus_id;
    $(".modify_syllabus_detail").click(function()
    {
        $("#syllabus_editor").modal();
        $(".syllabus_confirm").text("修改");
        $("#editor").html($(this).prev().html());
        modify_syllabus_id=$(this).parent().parent().attr("syllabus");
    });

    $(".syllabus_confirm").click(function()
    {
        if($(this).text()=="修改"&&$("#editor").html()!='')
        {
            $.post('/syllabus',{modify_syllabus_detail:"yes",detail:$("#editor").html(),id:modify_syllabus_id},function(data)
            {
                if(data=="modify syllabus sucess")
                {
                    $("[syllabus='"+modify_syllabus_id+"']").find(".syllabus_detail").html($("#editor").html());
                    $("#editor").html("");
                }
            });
        }
    });
});
