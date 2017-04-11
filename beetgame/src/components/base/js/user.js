/**
 * @author: Brave <u9648u6653u52c7@gmail.com>
 * @date: 2017-04-11
 */

var _ = require('lodash');
var $ = require('zepto');
var token = require('components/base/js/token');
var store = require('store');
var expirePlugin = require('store/plugins/expire');
store.addPlugin(expirePlugin);

function getUserInfo(callback) {

	if (!_.isFunction(callback)) return;

	var user = store.get('user');

	if (_.isPlainObject(user) && !_.isEmpty(user)) {
		return callback(user);
	} else {
		$.ajax({
			type: 'GET',
			url: '/index/api',
			data: {aPath:'btuser', c: 'api', t:token.getToken()},
			dataType: 'json', 
			success: function(data, status, xhr) {
				var userData = data.data,
					flag = data.status;
				var experienceRatio = null;
				if (200 == flag) {
					// 经验比值换算
					experienceRatio = +userData.experience / +userData.max_expe
					userData.experienceRatio = experienceRatio > 1 ? '100%' : experienceRatio*100 + '%';
					store.set('user', userData, _.now() + 15*60*1000);
					callback(userData);
				}
		  	},
		  	error: function(xhr, errorType, error){
		  		console.error(errorType, ':', error);
		  	}
		});
	}	
}

module.exports = getUserInfo;
