require('./page.less');
var $ = require('zepto');
var _ = require('lodash');
var url = require('url-lib');
var template = require('./index.hbs');
var token = require('components/base/js/token');

var root = $('.content');
var params = url.parseQuery(location.href);
var fan = 0;

/**
 * 清洗ajax请求的返回值，找到playerid对应的玩家信息
 * @param {Object} data 
 * @param {Number} flag
 */
function washRespData(data, flag) {
    var obj = _.merge({}, data);
    if (1 == flag) {
        _.forOwn(obj.choosen, function name(value, key) {
            obj.data[key].forEach(function(v,i){
                if (value == v.playerid) {
                    obj.choosen[key] = v;
                }
            });
        });
    } else {
        
    }
    return obj;
}

/**
 * 获取相关的房间信息
 * @param {Object} data 
 * @param {Function} callback 
 */
function getRoomInfo(data, callback) {
	if (!(_.isPlainObject(data) && _.isFunction(callback))) return;
	$.ajax({
		type: 'GET',
		url: '/api/fantasy/dailyplayers',
		headers: {
			Authorization: 'Bearer ' + token.getToken()
		},
		dataType: 'json',
		data: _.merge({}, data),
		success: function (resp, status, xhr) {
			callback(resp, status, xhr);
		},
		error: function(xhr, errorType, error){
	  		console.error(errorType, ':', error);
	  	}
	});
}


$(function() {

    if (_.isEmpty(params.id)) {
        console.log('roomid值异常！');
        return;
    }

    getRoomInfo({roomid: params.id}, function(resp, status, xhr) {
        if (200 !== resp.status) return;
        resp = washRespData(resp, params.isJoined);
        resp.customMsg = params.msg;

        for (var key in resp.choosen) {
            if (resp.choosen.hasOwnProperty(key) && !!resp.choosen[key]) {
                fan += resp.choosen[key].fan;
            };
        }

        resp.totalFanValue = fan.toFixed(2);

        root.append(template(resp));
    });

});