/**
 * Created by Administrator on 2017/4/25.
 */
require("./page.less");
require('components/sui/index');
var token = require('components/base/js/token');
var innerRecord=require("./recordCard/recordCard.hbs");
var page= 1,
    totalPage=null;
function getRecordsList(callback) {
    $.ajax({
        type: 'GET',
        url: '/api/exchange',
        headers: {
            Authorization: 'Bearer ' + token.getToken()
        },
        dataType: 'json',
        data: {
            page:page
        },
        success: function (resp) {
            console.log(resp);
            totalPage=resp.tpage;
            callback(resp);
        },
        error: function(xhr, errorType, error){
            console.error(errorType, ':', error);
        }
    });
}
getRecordsList(function(resp){
    $(".list-wapper").append(innerRecord(resp));
    $.init();
})
$(document).on('infinite', '.record-content .infinite-scroll-bottom',function() {
  if (page >totalPage) {
    $.detachInfiniteScroll($('.infinite-scroll'));
    $('.infinite-scroll-preloader').remove();
    return;
  }
  var _this=this;
  if (this.isLoading) return;
  this.isLoading = true;
  if(page==1) page++;
  getRecordsList(function(resp){
      if ( 200 == resp.status) {
        $('.list-wapper').append(innerRecord(resp));
        page ++;
        _this.isLoading = false;
      }
    })
})


