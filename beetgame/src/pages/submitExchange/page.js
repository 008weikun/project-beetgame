require("./page.less");
require('components/sui/index');
require("./city-picker");
var $=require("zepto");
var token = require('components/base/js/token');
var stored= $.parseJSON(window.localStorage.getItem("user"));
var addressInfo=stored.address;
var uid=stored.uid;
function userAdderss(){
    if(addressInfo){
        $("#user-name").val(addressInfo.user_name);
        $("#user-phone").val(addressInfo.phone);
        $("#city-picker").val(addressInfo.province+" "+addressInfo.city+" "+addressInfo.region);
        $("#user-details").val(addressInfo.address);
    }
}
function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  decodeURI(r[2]); return null;
}
(function getGoodsInfo(){
    $(".goods-pic").css({"background-image":"url("+GetQueryString("pic")+")"});
    $(".goods-name").text(GetQueryString("name"));
    $(".goods-price").text(GetQueryString("price"));
    $(".repertory-num").text(GetQueryString("stocks"));
    userAdderss();
    Quantity();
    showPageType();
})()
function showPageType(){
    var type= parseInt(GetQueryString("type"));
    if(type){
       $("#user-details").remove();
       $(".details").remove();
       $(".recharge-info").text("账号信息");
       $(".recharge-info+.inp-txt input").val("").prop("placeholder","请输入账号信息");
       $(".user-area").prop("id","");
       return true;
   }
   return false;
}
$("#city-picker").cityPicker({
  toolbarTemplate: '<header class="bar bar-nav">\
    <button class="button button-link pull-right close-picker">确定</button>\
    <h1 class="title">选择所在地区</h1>\
    </header>'
})
function Quantity(){
    var count=1;
    var goodsCost=$(".goods-price").text();
    $(".plus").click(function(){
      var maxR=parseInt($(".repertory-num").text());
      count>=maxR?count:count++;
      $(".show-digit").text(count);
      $(".goods-price").text(count*goodsCost);
    })
    $(".minus").click(function(){
      var minR=1;
      count<=minR?count:count--;
      $(".show-digit").text(count);
      $(".goods-price").text(count*goodsCost);
    })
}
$(".subbtn").on("click",function(){
  getUserExchange();
})
function getUserExchange() {
  var goodsNum=$(".show-digit").text();
  var userName=$("#user-name").val();
  var userPhone=$("#user-phone").val();
  var userAddressArr=$(".user-area").val().split(" ");
  var province=userAddressArr[0]||"";
  var city=userAddressArr[1]||"";
  var region=userAddressArr[2]||"";
  var address=$("#user-details").val();
  var account_num=$(".user-area").val();
  var t=showPageType(),
      j={};
  j.uid=uid;
  j.pid=GetQueryString("id");
  j.exchange_num=goodsNum;
  j.uname=userName;
  j.uphone=userPhone;
  if(t){
    j.account_num=account_num;
  }else{
    j.province=province;
    j.city=city;
    j.region=region;
    j.address=address;
  }
  $.ajax({
    type: 'POST',
    url: '/api/exchange',
    headers: {
      Authorization: 'Bearer ' + token.getToken()
    },
    dataType: 'json',
    data:j,
    success: function (resp) {
      $.toast(resp.errorMsg);
      if(resp.status==200){
        setTimeout(function(){
          window.location.href="/main.html#routers-mall";
        },1500)
      }
    }
  });
}


