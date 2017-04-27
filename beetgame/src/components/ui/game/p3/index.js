require('./index.less');
var $ = require('zepto');
var _ = require('lodash');
var url = require('url-lib');
var params = url.parseQuery(location.href);
var template = require('./index.hbs');

var root = $('#J_content .swiper-slide').eq(2);
var data = {
    award: _.isEmpty(params.award) ? '' : params.award
};

function render() {
    root.append(template(data));
}
module.exports = {
    render: render
};
