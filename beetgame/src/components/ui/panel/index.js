require('./index.less');
var $ = require('zepto');
var store = require('store/dist/store.modern.min');
var template = require('./index.hbs');
var token = require('components/base/js/token');
var getUserInfo = require('components/base/js/user');

function render() {
	getUserInfo(function(userInfo) {
		var root = $(template(userInfo)).appendTo('body');
		if (0 == userInfo.sign) {
			root.find('.sign .button').on('click', function(event) {
				var $this = $(this);
				$.ajax({
					type: 'POST',
					url: '/api/btsign',
					headers: {
						Authorization: 'Bearer ' + token.getToken()
					},
					dataType: 'json',
					data: {uid: userInfo.uid },
					success: function(resp, status, xhr) {
						if (200 == resp.status) {
							userInfo.sign = 1; userInfo.sign_number += 1;
							store.set('user', userInfo);
							$this.addClass('disabled').html('已签到').
								parent('.sign').find('span').html(userInfo.sign_number);
							$this.off('click');
						}
					}
				});
			});
		}
	});
}

module.exports = {
	render: render
};