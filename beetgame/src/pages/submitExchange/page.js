require("./page.less");
require('components/sui/index');
require("./city-picker");
var $=require("zepto");
var template=require("./gatherContent/gather.hbs");
var goodsCorrelation=require("./goodsCorrelation/index.hbs");
var token = require('components/base/js/token');
var stored= $.parseJSON(window.localStorage.getItem("user"));
var addressInfo=stored.address;
var uid=stored.uid;
var typeChoose={
  type:parseInt(GetQueryString("type")),
  pic:GetQueryString("pic"),
  name:GetQueryString("name"),
  price:GetQueryString("price"),
  stocks:GetQueryString("stocks"),
  address:{
    name:addressInfo.user_name,
    phone:addressInfo.phone||"",
    addressDetails:[addressInfo.province||"",addressInfo.city||"",addressInfo.region||""].join(" "),
    summarry:addressInfo.address
  }
}
function GetQueryString(name){
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  decodeURI(r[2]); return null;
}
(function getGoodsInfo(){
    $(".exchange-content").append(goodsCorrelation(typeChoose),template(typeChoose));
    Quantity();
})()
$("#city-picker").cityPicker({
  toolbarTemplate: '<header class="bar bar-nav">\
    <button class="button button-link pull-right close-picker">确定</button>\
    <h1 class="title">选择所在地区</h1>\
    </header>'
})
function Quantity(){
     var count= 1,minR=1;
     $(".plus").click(function(){
      var maxR=parseInt($(".repertory-num").text());
      count>=maxR?count:count++;
      $(".show-digit").text(count);
    })
    $(".minus").click(function(){
      count<=minR?count:count--;
      $(".show-digit").text(count);
    })
}
$(".subbtn").on("click",function(){
  getUserExchange();
})
function getUserExchange() {
  var goodsNum=$(".show-digit").text();
  var userName=$("#user-name").val();
  var userPhone=$("#user-phone").val();
  var t=typeChoose.type,
      j={};
  j.uid=uid;
  j.pid=GetQueryString("id");
  j.exchange_num=goodsNum;
  j.uname=userName;
  j.uphone=userPhone;
  if(t){
    var account_num=$(".recharge-txt").val();
    j.account_num=account_num;
  }else{
    var userAddressArr=$(".user-area").val().split(" ");
    var province=userAddressArr[0]||"";
    var city=userAddressArr[1]||"";
    var region=userAddressArr[2]||"";
    var address=$("#user-details").val();
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


