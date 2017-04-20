require('./index.less');
var _ = require('lodash');
var $ = require('zepto');
var getUserInfo = require('components/base/js/user');

function render() {
	getUserInfo(function(userInfo) {
		if (userInfo && !_.isEmpty(userInfo.head_pic) && 
		_.isString(userInfo.head_pic)) {
			$('#header img').attr('src', userInfo.head_pic);
		}

	});
}

module.exports = {
	render: render
};