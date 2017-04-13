require('./index.less');
var _ = require('lodash');
var $ = require('zepto');
var moment = require('moment');
var token = require('components/base/js/token');
var template = require('./index.hbs');
var roomTemplate = require('./matchCard/index.hbs');
var Handlebars = require('handlebars-template-loader/runtime');

Handlebars.registerHelper('formatDate', function(timeStamp){
	return moment(timeStamp*1000).format('YYYY/MM/DD h:mm');
});

Handlebars.registerHelper('formatIcon', function(value){
	return 1 == value ? 'chip' : 'bottole';
});

var currentPageNum = 1,
	totalPageNum = null,
	totalItemNum = null;

function getRoomList(pageNum, callback) {
	if (!(_.isNumber(pageNum) && _.isFunction(callback))) return;
	$.ajax({
		type: 'GET',
		url: '/api/fantasy/room',
		headers: {
			Authorization: 'Bearer ' + token.getToken()
		},
		dataType: 'json',
		data: {
			page: pageNum
		},
		success: function (resp, status, xhr) {
			callback(resp, status, xhr);
		},
		error: function(xhr, errorType, error){
	  		console.error(errorType, ':', error);
	  	}
	});
}

function render() {
	getRoomList(currentPageNum, function(resp, status, xhr){
		if ( 200 == resp.status) {
			currentPageNum += 1;
			totalPageNum = resp.tpage;
			totalItemNum = resp.totalItems;
			$('#J_view').append(template(resp));
			$.init(); // SUI 组件初始化
		}
	});
}

$(document).on('refresh', '.page-room .pull-to-refresh-content',function(event) {
  
    getRoomList(currentPageNum = 1, function(resp, status, xhr){
    	var container = $('.page-room .content');
    	if ( 200 == resp.status) {
			currentPageNum += 1;
			totalPageNum = resp.tpage;
			if (resp.totalItems > totalItemNum) {
				totalItemNum = resp.totalItems;
				container.find('.card').remove();
				container.append(template(resp));
			}
		}

    	$.pullToRefreshDone('.page-room .pull-to-refresh-content');
    });

});

var isLoading = false;

$(document).on('infinite', '.page-room .infinite-scroll-bottom',function() {
	if (currentPageNum >= totalPageNum) {
		return $.detachInfiniteScroll($('.page-room .infinite-scroll-bottom'));
	}
	if (isLoading) return;
	isLoading = true;
	getRoomList(currentPageNum, function(resp, status, xhr){
		if ( 200 == resp.status) {
			isLoading = false;
			currentPageNum += 1;
			$('.page-room .content').append(roomTemplate(resp));
		}
	});
});

[render].forEach(function(value) {
	module.exports[value.name] = value;
});