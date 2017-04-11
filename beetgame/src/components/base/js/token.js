/**
 * @author: Brave <u9648u6653u52c7@gmail.com>
 * @date: 2017-04-10
 */

var _ = require('lodash');
var $ = require('zepto');
var config = window.config || {};

function getToken() {
	var token = config.token;
	if (validateToken(token)) return token;
}

/**
 * setToken
 * @param handler  token值的引用
 * @param {String} newTokenValue
 * @return {Stirng} newTokenValue
 */
function setToken(handle, newTokenValue) {
	if (validateToken(newTokenValue)) {
		return handle.token = newTokenValue;
	}
}

/**
 * validateToken
 * @param  {String} tokenValue
 * @return {Boolean}
 */
function validateToken(tokenValue) {
	if (!_.isEmpty(tokenValue) && _.isString(tokenValue) &&
		 tokenValue.length === 192) {
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
function refreshToken(url, oldTokenValue) {
	if (!validateToken(oldTokenValue)) return false;
	$.ajax({
		type: 'GET',
		url: url,
		data: {c:'api', t:oldTokenValue},
		dataType: 'json', 
		timeout: 500, 
		success: function(data, status, xhr) {
			var flag = data.code,
				token = data.message;
			if (1 == flag && token != getToken()) {
				setToken(config, token);
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
function autoRefreshToken (url, time) {
	timer = setInterval(function(){
		refreshToken(url, getToken());
	}, time);
}

function stopAutoRefreshToken() {
	window.clearInterval(timer);
}

autoRefreshToken('/checktoken/index', 30*60*1000);

/**
 * token值失效后，自动用新的token值重新请求
 */

var tokenREG = /((^|\?|&)?t=)([^&]*)(&|$)?/;

$(document).on('ajaxSuccess', function(event, xhr, options) {

	var	responseData = JSON.parse(xhr.responseText);
		flag  = responseData.code,
		token = responseData.message,
		status = responseData.status;

	var requestParams = options,
		requestMethod = (options.type).toLowerCase();

	var oldTokenValue = null;

	if ('get' === requestMethod && _.isString(requestParams.url)) {
		oldTokenValue = requestParams.url.match(tokenREG)[3];
	} else if ('post' === requestMethod && _.isString(requestParams.data)) {
		oldTokenValue =requestParams.data.match(tokenREG)[3];
	}

	if ( 1 == flag && 401 == status && token != oldTokenValue ) {
		
		setToken(config, token);

		if ('get' === requestMethod && _.isString(requestParams.url)) {
			requestParams.url = requestParams.url.replace(tokenREG, '$1' + token + '$4');
		} else if ('post' === requestMethod && _.isString(requestParams.data)) {
			requestParams.data =requestParams.data.replace(tokenREG, '$1' + token + '$4');
		}
		$.ajax(requestParams);
	}
});


[getToken, setToken, refreshToken, autoRefreshToken, stopAutoRefreshToken].forEach(function(value) {
	module.exports[value.name] = value;
});

