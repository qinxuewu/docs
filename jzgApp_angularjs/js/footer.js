$(function(){
	var text=$(".index-footer").attr("data");
	var footer='';
		footer +='<ul class="menu-footer">';
		if (text=="首页") {
			footer +='<li openView="index.html"><a class="on"><i class="iconfont">&#xe606;</i><p class="on">首页</p></a></li>';
		}else{
			footer +='<li openView="index.html"><a ><i class="iconfont">&#xe606;</i><p>首页</p></a></li>';
		}
		if (text=="发布") {
			footer +='<li openView="MyFabu.html"><a  class="on"><i class="iconfont">&#xe60c;</i><p class="on">发布</p></a></li>';
		}else{
			footer +='<li openView="MyFabu.html"><a ><i class="iconfont">&#xe60c;</i><p>发布</p></a></li>';
		}
		
		if (text=="消息") {
			footer +='<li iopenView="message.html"><a  class="on"><i class="iconfont">&#xe604;</i><p class="on">消息</p></a></li>';
		}else{
			footer +='<li openView="message.html"><a ><i class="iconfont">&#xe604;</i><p>消息</p></a></li>';
		}
		if (text=="个人") {
			footer +='<li openView="userinfo.html"><a  class="on"><i class="iconfont">&#xe612;</i><p class="on">个人</p class="on"></a></li>';
		}else{
			footer +='<li openView="userinfo.html"><a ><i class="iconfont">&#xe612;</i><p>个人</p></a></li>';
		}	
		footer +='</ul>';
		$(".index-footer").html(footer);
		
		$(".menu-footer li").on("tap",function(){
 				var url=$(this).attr("openView");
 				if(url){
 					window.location.href=url;
 				}
 				
 			});
});


