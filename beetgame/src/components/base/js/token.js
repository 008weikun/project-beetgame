/**
 * @author: Brave <u9648u6653u52c7@gmail.com>
 * @date: 2017-04-10
 */

var _ = require('lodash');
var $ = require('zepto');
var store = require('store/dist/store.modern.min');
var cookie = require('components/base/js/cookie');

/**
 * getTokenFromPage 从页面获取后端输出的token值
 * 三种取值方式：DOM节点、对象引用、cookie
 * @return {String} 
 */
function getTokenFromPage(handle) {
	var token = null;
	if (handle && handle.nodeType === 1) {
		if ('input' == handle.tagName.toLowerCase() && 'hidden' == handle.type) {
			token = handle.value;
		}
	} else if(handle && handle.token) {
		token = handle.token;
	} else if(_.isString(handle)) {
		token = cookie.get(handle);
	}
	return setToken(token);
}


function getToken() {
	var token = store.get('token') || getTokenFromPage(window.config);
	if (validateToken(token)) return token;
}

/**
 * setToken
 * @param {String} newTokenValue
 * @return {Stirng} newTokenValue
 */
function setToken(newTokenValue) {
	if (validateToken(newTokenValue)) {
		return store.set('token', newTokenValue);
	}
}

/**
 * validateToken
 * @param  {String} tokenValue
 * @return {Boolean}
 */
function validateToken(tokenValue) {
	if (!_.isEmpty(tokenValue) && _.isString(tokenValue)) {
		return true;
	} else {
		console.warn('token值异常！');
		return false
	}
}

/**
 * refreshToken
 * @param  {String} url
 * @param  {String} oldTokenValue
 */
function refreshToken(oldTokenValue) {
	if (!validateToken(oldTokenValue)) return false;
	$.ajax({
		type: 'GET',
		url: '/api/checktoken',
		headers: {
			Authorization: 'Bearer ' + oldTokenValue
		},
		dataType: 'json', 
		success: function(data, status, xhr) {
			var flag  = data.code,
				token = data.message;
			if (1 == flag && token != oldTokenValue) {
				setToken(token);
			}
	  	},
	  	error: function(xhr, errorType, error){
	  		console.error(errorType, ':', error);
	  	}
	});
}

var timer = null;

/**
 * autoRefreshToken
 * @param {String} 
 * @param {Number} time 毫秒 计时器运行周期， 后端token生命周期为1小时
 */
function autoRefreshToken (time) {
	timer = setInterval(function(){
		refreshToken(getToken());
	}, time);
}

function stopAutoRefreshToken() {
	window.clearInterval(timer);
}

autoRefreshToken(30*60*1000);

/**
 * token值失效后，自动用新的token值重新请求
 */

// var tokenREG = /((^|\?|&)?t=)([^&]*)(&|$)?/;

$(document).on('ajaxError', function(event, xhr, options) {
	if (xhr.status !== 401) return;
	var	responseData = JSON.parse(xhr.responseText);
		flag  = responseData.code,
		token = responseData.message,
		status = responseData.status;

	var requestParams = options,
		oldTokenValue = requestParams.headers && 
						requestParams.headers['Authorization'] && 
						requestParams.headers['Authorization'].split(/\s+/).pop();


	if ( 1 == flag && 401 == status && token != oldTokenValue ) {
		
		setToken(token);

		if (_.isPlainObject(requestParams.headers)) {
			requestParams.headers['Authorization'] = 'Bearer ' + token;
		} 

		$.ajax(requestParams);
	}
});


module.exports = {
	getToken: getToken,
	setToken: setToken,
	refreshToken: refreshToken,
	autoRefreshToken: autoRefreshToken, 
	stopAutoRefreshToken: stopAutoRefreshToken
};

