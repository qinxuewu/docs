
var utils = (function(){
    /**
     * 显示模板数据
     * @param  {String|Object} tplId         模板id
     * @param  {String|Object} renderTo      渲染容器
     * @param  {Object}        data          JSON数据
     * @param  {String}        renderType    渲染方法类型，html|append|prepend|after等jQuery方法
     * @return {Object}        jQuery dom对象
     */
    function render(tplId, renderTo, data, renderType){
        var html;
        try{
            html = $(tplId).html()
        }catch(e){
            html = tplId;
        }

        var template = Handlebars.compile(html),
            renderType = renderType || "html";
        var $tpl = $($.trim(template(data)));
        $(renderTo)[renderType]($tpl);
        return $tpl;
    }

    function callNative(funcName, args){
        args = args || [];
        if( /iPhone/.test(navigator.userAgent) ){
            var url = "ss:"+funcName;
            if(args){
                url += "/";
                url += JSON.stringify(args);
            }
            location.href = url;
             console.log(url);

        }else{
            window.callNative[funcName](JSON.stringify(args));

        }
    }
    return {
        render: render,
        callNative: callNative,
    }
})();

// //格式化时间 几分钟前 几小时前 准确日期
// Handlebars.registerHelper("prettifyDate", function(time) {
//     var now=new Date();
//     var before=new Date(time.replace(/-/g,'/'))/1000;
//     var now=now.getTime()/1000;
//     if((0<=(now+100-before))&&now-before<3600){
//         //alert(now-before)
//         return Math.ceil((now-before)/60)+"分钟前";
//     }
//     if(now-before>3600 && now-before<86400){
//         return Math.floor((now-before)/3600)+"小时前";
//     }
//     //超过一天
//     if(now-before>=86400){
//         return time.substring(0,10);
//     }
// });

//将url变成json数据
function urlToJSON(){
    //url=？xx=yy&ff=jj格式值
    //将url变成json数据
    var k_v=decodeURI(window.location.search).substring(1).split("&");
    var data={};
    for(var i=0; i<k_v.length; i++){
        var arr=k_v[i].split("=");
        data[arr[0]]=arr[1];
    }
    return data;
};

//图片放大
var index=0;
$(document).on("click",".img",function(){
	 var imgurl=$(this).attr("src");
	
	if(index%2==0){
		 $("body").append(
					"<div class='dimg img' style='width: 100%;height: 100%;z-index: 9999;position:fixed;top:0;background: #1B1919;'>" +
					"<img src='"+imgurl+"' style='width: 100%;height:auto;position:fixed;top: 50%;transform: translateY(-50%);-webkit-transform: translateY(-50%);z-index:10000;' /></div>");
	}else if(index%2==1){
		 $(".dimg").remove();
	}
	 index++;
		   
});

//下拉刷新，上啦加载
function  pullrefresh(){
	mui.init({
				pullRefresh: {
					container: '#pullrefresh',

					up: {
						contentrefresh: '正在加载...',
						callback: pullupRefresh
					}
				}
			});
			/**
			 * 上拉加载具体业务实现
			 */
			function pullupRefresh() {
				setTimeout(function() {
					mui('#pullrefresh').pullRefresh().endPullupToRefresh((false)); //参数为true代表没有更多数据了。
					// }
				}, 500);
			}
			if (mui.os.plus) {
				mui.plusReady(function() {
					setTimeout(function() {
						mui('#pullrefresh').pullRefresh().pullupLoading();
					}, 500);

				});
			} else {
				mui.ready(function() {
					mui('#pullrefresh').pullRefresh().pullupLoading();
				});
			}
}
//初始化区域滚动
mui('.mui-scroll-wrapper').scroll({deceleration: 0.0005});

//短信验证码倒计时
function sendCode(){
		$("#send").attr("disabled",true);
	    $("#send").css("background","#cccccc");
	    $("#send").val(60+"秒后再获取");
		var i=59;
	    var x=setInterval(function(){
	     $("#send").val(i+"秒后再获取");
	       	i--;
	       	if(i==-1){
	       		clearInterval(x);
	       		$("#send").removeAttr("disabled");
	       		$("#send").css("background-color","#56E15C");
	       		$("#send").val("重新发送");
	       	}
	      }, 1000);
	}

function  picker(){
//级联插件
(function($, doc) {
				$.init();
				$.ready(function() {
					//性别  普通示例
					var userPicker = new $.PopPicker();
					userPicker.setData([{
						value: '1',
						text: '男'
					}, {
						value: '2',
						text: '女'
					}]);
					var sexSelect = doc.getElementById('xingbie');
					if(sexSelect){
						sexSelect.addEventListener('tap', function(event) {
							userPicker.show(function(items) {
							 // var sex=JSON.stringify(items[0]);
								// console.log(items[0].text);
								sexSelect.value=items[0].text;
							});
						}, false);
					}

					//结算方式
					var jiesuanPicker = new $.PopPicker();
					jiesuanPicker.setData([{
						value: '1',
						text: '日结'
					},{
						value: '2',
						text: '月结'
					},{
						value: '3',
						text: '年结'
					}]);
					var jiesuan = doc.getElementById('jiesuan');
					if(jiesuan){
						jiesuan.addEventListener('tap', function(event) {
							jiesuanPicker.show(function(items) {
								jiesuan.value=items[0].text;
							});
						}, false);
					}

				
					//时间区间
					var dateQJPicker = new $.PopPicker();
					dateQJPicker.setData([{
						value: '1',
						text: '一周'
					},{
						value: '2',
						text: '一个月'
					},{
						value: '3',
						text: '一年'
					}]);
					var jujian = doc.getElementById('jujian');
					var jujiantext = doc.getElementById('jujian-text');
					if(jujian){
						jujian.addEventListener('tap', function(event) {
							dateQJPicker.show(function(items) {
								jujiantext.innerHTML=items[0].text;
							});
						}, false);
					}

					//工种类别  二级联动
					var gtypePicker2 = new $.PopPicker({layer: 2});
					gtypePicker2.setData([{
						value: '1',
						text: '计算机',
						children: [{value: "1",text: "java开发"}]
					},{
						value: '2',
						text: '设计师',
						children: [{value: "2",text: "平面设计"}]
					}]);
					var gtype = doc.getElementById('gtype');
					if(gtype){
						gtype.addEventListener('tap', function(event) {
							gtypePicker2.show(function(items) {
								gtype.value =(items[1] || {}).text;
							});
						}, false);
					}

					//工种类型
					var ptypePicker2 = new $.PopPicker({layer: 2});
					ptypePicker2.setData([{
						value: '1',
						text: '计算机',
						children: [{value: "1",text: "java开发"}]
					},{
						value: '2',
						text: '设计师',
						children: [{value: "2",text: "平面设计"}]
					}]);
					var ptype = doc.getElementById('ptype');
					var ptypeText = doc.getElementById('ptypeText');
					if(ptype){
						ptype.addEventListener('tap', function(event) {
							ptypePicker2.show(function(items) {
								ptypeText.innerHTML =(items[1] || {}).text;
							});
						}, false);
					}

					//2级城市级联示例
					var cityPicker2 = new $.PopPicker({layer: 2});
					cityPicker2.setData(cityData3);
					var cityBtn2 = doc.getElementById('city2');
					var cityText= doc.getElementById('cityText');
					if(cityBtn2){
						cityBtn2.addEventListener('tap', function(event) {
							cityPicker2.show(function(items) {
								cityText.innerHTML =(items[1] || {}).text;
							});
						}, false);
					}

					//三级城市级联示例
					var cityPicker3 = new $.PopPicker({layer: 3});
					cityPicker3.setData(cityData3);
					var cityBtn = doc.getElementById('city');
					if(cityBtn){
						cityBtn.addEventListener('tap', function(event) {
							cityPicker3.show(function(items) {
								cityBtn.value =(items[0] || {}).text + " " + (items[1] || {}).text + " " + (items[2] || {}).text;
							});
						}, false);
					}
				});
			})(mui, document);
}
//手机端图片上传
$('input[type="file"]').on("change", function(){
         fs = this.files[0];
        console.log(fs);
        var url = (window.URL || window.webkitURL).createObjectURL(fs);
        if(fs.type.indexOf('image') > -1){
           $(this).prev("img").attr("src",url);
        }
    })

// //提示等待蒙版
// $(function(){
// 		window.MB = {
// 			create: function(){
// 				MB.div = $('<div id="MB"><span id="loadDiv"><img src="images/load.gif"><span></div>').appendTo('body');
// 			},
// 			open: function(){
// 				if(!MB.div) MB.create();
// 				MB.div.fadeIn();
// 			},
// 			close: function(){
// 				MB.div.fadeOut();
// 			}
// 		};
// });

//提示等待蒙版
$(function(){
		window.MB = {
			// create: function(){
			// 	MB.div = $('<div id="MB"><span id="loadDiv"><img src="images/load.gif"><span></div>').appendTo('body');
			// },
			open: function(){
				// if(!MB.div) MB.create();
				//MB.div.sho();
				$('#MB').show();
			},
			close: function(){

				$('#MB').hide(1000);

			}
		};
});