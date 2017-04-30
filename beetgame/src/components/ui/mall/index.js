/**
 * Created by Administrator on 2017/4/24.
 */
require("./index.less");
var innerContent=require("./index.hbs");
var $ = require('zepto');
var token = require('components/base/js/token');
var goodsCard= require('./goodscard/goodscard.hbs');
var defaultParams={
    sort:"",
    page:1,
    goodsType:"all"
}
var totalPage=null;
function getGoodsList(sort,page,goodsType,callback) {
  $.ajax({
    type: 'GET',
    url: '/api/goods',
    headers: {
      Authorization: 'Bearer ' + token.getToken()
    },
    dataType: 'json',
    data: {
      sort:sort,
      page:page,
      goods_type:goodsType
    },
    success: function (resp) {
      totalPage=resp.tpage;
      callback(resp);
    },
    error: function(xhr, errorType, error){
<<<<<<< HEAD
      //console.error(errorType, ':', error);
=======
      console.error(errorType, ':', error);
>>>>>>> f05767b348e10504d238a00459d60d6e5a76b2de
    }
  });
}
function render(){
  var userQuota= $.parseJSON(window.localStorage.getItem("user"));
  getGoodsList(defaultParams.sort,defaultParams.page,
  defaultParams.goodsType,function(json){
    $("#goods_view").append(innerContent(json));
    $(".mycast").text(userQuota.three_level);
    $.init();
    bindTap();
  })
}
//tap 事件绑定
function bindTap(){
    $(".sort-title").bind("click","[class^=sort-]",function(){
      var _goodType=$(this).attr("goods_Type"),
          _goodsName=$(this).attr("goods_name");
      switch (_goodType){
          case "all":
            $(this).find(".arrows_all").toggleClass("checked");
            $(".secondary-menu").toggle();
          break;
          case "price":
            checkStatus(_goodsName,$(this),"p");
          break;
          case "sales":
            checkStatus(_goodsName,$(this),"s")
          break;
      }
    })
    $(".choose-list").on("click","span",function(){
         defaultParams.page=1;
         defaultParams.sort='';
         defaultParams.goodsType=$(this).attr("accesskey");
         $(".secondary-menu").hide();
         $(".showtype").text($(this).text());
         $(".arrows_all").removeClass("checked");
         relevantData();
    });
    $(".record").click(function(){
        window.location.href='/exchange.html';
    })
}
//向下滚动
$(document).on('infinite', '.goods-list .infinite-scroll-bottom',function() {
  if (defaultParams.page >totalPage) {
    $('.infinite-scroll-preloader').remove();
    return;
  }
  var _this=this;
  if (this.isLoading) return;
  this.isLoading = true;
  if(defaultParams.page==1) defaultParams.page++;
  getGoodsList(defaultParams.sort, defaultParams.page,
  defaultParams.goodsType,function(resp){
    if ( 200 == resp.status) {
      $('.goods-list .container-wrapper').append(goodsCard(resp));
      defaultParams.page ++;
      _this.isLoading = false;
    }
  })
})
function checkStatus(name,el,mark){
    defaultParams.page=1;
    defaultParams.goodsType="all";
    if(name){
       if(name==mark+"sd"){
         el.attr("goods_name",mark+"sa").find(".arrows").prop("class","arrows sortup");
         defaultParams.sort=mark+"sa";
       }else{
         el.attr("goods_name",mark+"sd").find(".arrows").prop("class","arrows sortdown");
         defaultParams.sort=mark+"sd";
       }
    }else{
      el.attr("goods_name",mark+"sd").find(".arrows").prop("class","arrows sortdown");
      defaultParams.sort=mark+"sd";
    }
    relevantData();
}
//选择获取相应数据
function relevantData(){
    $(".goods-list .container-wrapper").empty();
    getGoodsList(defaultParams.sort,defaultParams.page,
    defaultParams.goodsType,function(data){
        $('.goods-list .container-wrapper').append(goodsCard(data));
        if(data.tpage==1) $('.infinite-scroll-preloader').remove();
    })
}
module.exports.render=render;
