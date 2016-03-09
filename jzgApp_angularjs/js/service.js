var URL_HEAD="http://192.168.0.6:8080/buildworkerapi/rest/";
var page=1;
var pageSize=10;
var token = localStorage.getItem("token"); 

/**服务  后台交互****/
app.factory('appService', function($http){
    return{
        orderList:function(){
            var  datalist=[{
                img:'images/111.png',title:'东南亚总统套房',
                begin:'2015-12-12',end:'2015-12-12',
                count:'118',status:'1'
                }];

                return datalist;
         },
         userinfo:function(){
             var  datalist="";
             $.ajax({
                    type : "post",
                    dataType : "json",
                    url : URL_HEAD+"common/login",
                    async: false,
                    data: {"u":"18680442453","p":"123456","ua":"1"},
                    success:function(data) {
                        datalist=data;
                    },
             });
            return datalist;
         }
    } 
})