$(document).ready(function()
{
    var user;
    $.post("/draw",{request:"yes"},function(data){user=data},"json");

    $(".user_class").click(function()
    {
        var s="";
        for(var i=0;i<user['name'].length;i++)
        {
            if($(this).val()==user['class'][i])
            {
                s+='<option value="'+user['num'][i]+'">'+user['num'][i]+'</option>';
            }
        }
        $(".user_num").html(s);
    });
    $(".user_num").click(function()
    {
        var s="";
        for(var i=0;i<user['name'].length;i++)
        {
            if($(this).val()==user['num'][i])
            {
                s+='<option value="'+user['id'][i]+'">'+user['name'][i]+'</option>';
            }
        }
        $(".user_name").html(s);
    });


    $(".draw_course").click(function()
    {
        var course_check=$(this).parent().parent().find("[name='course']");
        var class_check=$(this).parent().parent().find("[name='class']");
        var course;
        var user_class=new Array();
        var k1=0;
        for(var i=0;i<course_check.length;i++)
        {
            if($($(course_check)[i]).is(':checked')==true)
            {
                course=$($(course_check)[i]).val();
                k1=1;
                break;
            }
        }
        var k2=0;
        for(var i=0;i<class_check.length;i++)
        {
            if($($(class_check)[i]).is(':checked')==true)
            {
                user_class.push($($(class_check)[i]).val());
                k2=1;
            }
        }
        if(k1==1&&k2==1)
        {
            var s=user_class.join(',')
            $.post("/draw",{draw_course:"yes",course:course,class:s},function(data)
            {
                var series=new Array();
                for(var i=0;i<data.length;i++)
                {
                    var series_name=data[i]['class'];
                    var series_data=new Array();
                    for(var j=0;j<data[i]['score'].length;j++)
                    {
                        series_data.push(data[i]['score'][j]);
                    }
                    series.push({name:series_name,data:series_data})
                }
                var week=new Array();
                for(var i=0;i<data[0]['score'].length;i++)
                {
                    week.push("第"+(i+1)+"周");
                }
                var options = {
                    chart: {type: 'line' },
                    title: {text: course+' 各班每周作业平均分数'},
                    xAxis: {title: {align:'high',text: '周数'},categories: week},
                    yAxis: {title: {align:'high',text: ''},min: 0,max: 100},
                    series: series,
                    credits:{enabled:false}
                };
                $('#chart').highcharts(options);
            }
            ,"json");
        }

    });

    $(".draw_class").click(function()
    {
        var course_check=$(this).parent().parent().find("[name='course']");
        var class_check=$(this).parent().parent().find("[name='class']");
        var user_class;
        var course=new Array();
        var k1=0;
        for(var i=0;i<class_check.length;i++)
        {
            if($($(class_check)[i]).is(':checked')==true)
            {
                user_class=$($(class_check)[i]).val();
                k1=1;
                break;
            }
        }
        var k2=0;
        for(var i=0;i<course_check.length;i++)
        {
            if($($(course_check)[i]).is(':checked')==true)
            {
                course.push($($(course_check)[i]).val());
                k2=1;
            }
        }
        if(k1==1&&k2==1)
        {
            var s=course.join(',')
            $.post("/draw",{draw_class:"yes",course:s,class:user_class},function(data)
            {
                var series=new Array();
                var user=new Array();
                for(var i=0;i<data.length;i++)
                {
                    if(i>0 && data[i]['name'].length>data[i-1]['name'].length)
                    {
                        for(var j=0;j<data[i]['name'].length;j++)
                        {
                            user.push(data[i]['name'][j]);
                        }
                    }
                    if(i==0)
                    {
                        for(var j=0;j<data[0]['name'].length;j++)
                        {
                            user.push(data[0]['name'][j]);
                        }
                    }
                }
                for(var i=0;i<data.length;i++)
                {
                    var series_name=data[i]['course'];
                    var series_data=new Array();
                    for(var j=0;j<user.length;j++)
                    {
                        var g=0;
                        for(var k=0;k<data[i]['name'].length;k++)
                        {
                            if(user[j]==data[i]['name'][k])
                            {
                                series_data.push(data[i]['score'][k]);
                                g=1;
                            }
                        }
                        if(g==0){series_data.push('0');}
                    }
                    series.push({name:series_name,data:series_data})
                }
                var options = {
                    chart: {type: 'column' },
                    title: {text: user_class+'班 '+course+' 作业各人平均分数'},
                    xAxis: {title: {align:'high',text: ''},categories: user},
                    yAxis: {title: {align:'high',text: ''},min: 0,max: 100},
                    series: series,
                    credits:{enabled:false}
                };
                $('#chart').highcharts(options);
            }
            ,"json");
        }

    });

    $(".draw_user").click(function()
    {
        var course_check=$(this).parent().parent().find("[name='course']");
        var id=$(".user_name").val();
        var name=$(".user_name").text();
        var course=new Array();
        var k1=0;
        for(var i=0;i<course_check.length;i++)
        {
            if($($(course_check)[i]).is(':checked')==true)
            {
                course.push($($(course_check)[i]).val());
                k1=1;
            }
        }
        if(k1==1&&id!=null)
        {
            var s=course.join(',')
            $.post("/draw",{draw_user:"yes",course:s,user:id},function(data)
            {
                var series=new Array();
                for(var i=0;i<data.length;i++)
                {
                    var series_name=data[i]['course'];
                    var series_data=new Array();
                    for(var j=0;j<data[i]['score'].length;j++)
                    {
                        series_data.push(data[i]['score'][j]);
                    }
                    series.push({name:series_name,data:series_data})
                }
                var week=new Array();
                for(var i=0;i<data[0]['score'].length;i++)
                {
                    week.push("第"+(i+1)+"周");
                }
                var options = {
                    chart: {type: 'line' },
                    title: {text: name+' '+course+' 各周作业平均分数'},
                    xAxis: {title: {align:'high',text: '周数'},categories: week},
                    yAxis: {title: {align:'high',text: ''},min: 0,max: 100},
                    series: series,
                    credits:{enabled:false}
                };
                $('#chart').highcharts(options);
            }
            ,"json");
        }

    });

});