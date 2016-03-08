
//初始化配置
var app = angular.module('app', ['ngRoute']).run(function($rootScope) {
        $rootScope.header={show:true,title:'',back:false,indextitle:true};
        $rootScope.footer={show:true,calss:"mui-content-footer-buttom"}

});

//路由配置
app.config(function($routeProvider) {
    $routeProvider.when('/index',{
        templateUrl:'index.html',
        controller:'indexCtrl'
    }).when('/userinfo',{
        templateUrl:'userinfo.html',
        controller:'userinfoCtrl'
    }).when('/bindingPhone',{
        templateUrl:'bindingPhone.html',
        controller:'bindingPhoneCtrl'
    }).when('/certification',{
        templateUrl:'certification.html',
        controller:'certificationCtrl'
    }).when('/certificationOver',{
        templateUrl:'certificationOver.html',
        controller:'certificationOverCtrl'
    }).when('/companyPuth',{
        templateUrl:'companyPuth.html',
        controller:'companyPuthCtrl'
    }).when('/companyPuthOver',{
        templateUrl:'companyPuthOver.html',
        controller:'companyPuthOverCtrl'
    }).when('/fankui',{
        templateUrl:'fankui.html',
        controller:'fankuiCtrl'
    }).when('/findProject',{
        templateUrl:'findProject.html',
        controller:'findProjectCtrl'
    }).when('/findpwd',{
        templateUrl:'findpwd.html',
        controller:'findpwdCtrl'
    }).when('/myFabu',{
        templateUrl:'MyFabu.html',
        controller:'myFabuCtrl'
    }).when('/myhireWorkerList',{
        templateUrl:'MyhireWorkerList.html',
        controller:'myhireWorkerListCtrl'
    }).when('/myjifen',{
        templateUrl:'myjifen.html',
        controller:'myjifenCtrl'
    }).when('/projectDetalis',{
        templateUrl:'projectDetalis.html',
        controller:'projectDetalisCtrl'
    }).when('/propagandaIndex',{
        templateUrl:'propagandaIndex.html',
        controller:'propagandaIndexCtrl'
    }).when('/register',{
        templateUrl:'register.html',
        controller:'registerCtrl'
    }).when('/restPwd',{
        templateUrl:'restPwd.html',
        controller:'restPwdCtrl'
    }).when('/serachProject',{
        templateUrl:'serachProject.html',
        controller:'serachProjectCtrl'
    }).when('/updatePwd',{
        templateUrl:'updatePwd.html',
        controller:'updatePwdCtrl'
    }).when('/userinfo',{
        templateUrl:'userinfo.html',
        controller:'userinfoCtrl'
    }).when('/userUpdate',{
        templateUrl:'userUpdate.html',
        controller:'userUpdateCtrl'
    }).when('/yejiList',{
        templateUrl:'yejiList.html',
        controller:'yejiListCtrl'
    }).otherwise({
        redirectTo: '/index'
    })
});



//首页
app.controller('indexCtrl', function($scope,$location,$rootScope){
        MB.open();
     	$rootScope.header={show:true,title:'',back:false,indextitle:true};
        $rootScope.footer={show:true,calss:"mui-content-footer-buttom"}
        mui('.mui-scroll-wrapper').scroll({deceleration: 0.0005});        
        $rootScope.sing=function(){
       
        		$.alert('签到成功');
                

        }
         MB.close();
});



app.controller('userinfoCtrl', function($scope,$location,$rootScope){
        MB.open();
        $rootScope.header={show:true,title:'个人中心',back:false,indextitle:false};
        $rootScope.footer={show:true,calss:"mui-content-footer-buttom"}
        mui('.mui-scroll-wrapper').scroll({deceleration: 0.0005});        
       
         MB.close();
});





