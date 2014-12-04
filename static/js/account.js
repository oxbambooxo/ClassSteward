$(document).ready(function()
{
  $("#passwd").keydown(function(event)
  {
    if(event.keyCode == 13) 
    { 
      $("#submit").click();
    }
  });

  if($("#logout").length > 0)
  {
    keepliving();
  };
  
  function keepliving()
  {
    $.post("/account",{living:1},function(data,status)
    {
      if(data[0]=="user is living")
      {
        if(data[1]!=0){$(".new_msg").text(data[1])}
        else{$(".new_msg").text("")}
        setTimeout(function(){keepliving();},60000);
      }
    }
    ,"json");
  };

  $("#submit").click(function()
  {
    password=$("#passwd").val();
    $.post("/account",
    {
      login:"yes",
      account:$("#account").val(),
      passwd:hex_md5(password)
    },
    function(data,status)
    {
      if(data=="login success")
      {
        location=location;
      }
      else
      {
        if(data=="login failed")
        {
          passwd:$("#passwd").val('');
          $("form").attr("data-content","账号或密码错误！");
          $("form").popover("show");
          setTimeout(function(){$("form").popover("destroy");},3000);
        }
        else
        {
          passwd:$("#passwd").val('');
          $("form").attr("data-content","不可以重复登录！");
          $("form").popover("show");
          setTimeout(function(){$("form").popover("destroy");},3000);
        }
      }
    });
  });

  $("#narrowscreen").click(function(){$.post("/account",{screen:0},function(data,status){location=location;});});
  $("#widescreen").click(function(){$.post("/account",{screen:1},function(data,status){location=location;});});

});