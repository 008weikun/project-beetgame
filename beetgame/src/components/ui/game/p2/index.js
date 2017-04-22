require('./index.less');
require('components/zepto/selector');
var $ = require('zepto');
var _ = require('lodash');
var url = require('url-lib');
var params = url.parseQuery(location.href);
var Swiper = require('swiper/dist/js/swiper.min');
var token = require('components/base/js/token');
var template = require('./index.hbs');

var root = $('#J_content .swiper-slide').eq(1);
var iscroll = require('iscroll');
/**
 * 获取队伍数据
 * @param {Object} data 
 * @param {Function} callback 
 */
function getPKTeamInfo(data, callback) {
	if (!(_.isPlainObject(data) && _.isFunction(callback))) return;
	$.ajax({
		type: 'GET',
		url: '/api/fantasy/roomschedules',
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

/**
 * 获取隐藏DOM的属性信息数据信息
 * @param {Object} dom 
 * @param {String} pseudo 伪元素
 * @return {Object} 
 */
function getDisplayNoneDomStyle(dom, pseudoEle) {
    var getComputedStyle = null;
    var originDomStyle = null;
    var StyleObject = null;
    var preudo = null;
    var styleCssText  = '';
    var pseudoEleArr = [':before', ':after'];
    var prop = {
        display: 'block',
        position: 'absolute',
        left: '-10000px'
    };

    if (!(dom && 1 === dom.nodeType)) {
        console.warn('请传入合法的DOM!');
        return false;
    }

    if (!(window && window.getComputedStyle)) {
        console.warn('您所使用的浏览器不支持getComputedStyle函数');
        return false;
    }


    styleCssText = dom.style.cssText;
    getComputedStyle = window.getComputedStyle;
    preudo = pseudoEle && pseudoEleArr.indexOf(pseudoEle) !== -1 ? pseudoEle : null;
    originDomStyle = getComputedStyle(dom, preudo);

    if ( originDomStyle['display'] != 'none') {
        return Object.assign({},originDomStyle);
    }

    // 显示dom后重新计算dom的样式
    for (var key in prop) {
        if (prop.hasOwnProperty(key)) {
            dom.style[key] = prop[key];
        }
    }

    StyleObject = Object.assign({}, getComputedStyle(dom, preudo));

    // 重置样式
    if (styleCssText.length > 0) {
        dom.style.cssText = styleCssText;
    } else {
        dom.removeAttribute('style');
    }
    
    return StyleObject;
}

// 注册事件
function bindEvent(data) {
    var height = 0;
    var SELECTOR_GD = '.game-detail'
    var elements = root.find(SELECTOR_GD);
    
    if (elements.length > 0) {

        height = getDisplayNoneDomStyle(elements[0]).height;

        // 赛事卡片的点击事件
        root.on('click', '.card', function(event) {
            var $this = $(this);
            var content = $this.siblings(SELECTOR_GD);
            elements.not(content).hide();

            if (content.is(':hidden')) {
                content.height(0).show().height(height);
            } else {
                content.height(0);
                setTimeout(function(){content.hide();},300);
            }

        });

        // 队员的滚动效果
     /*   elements.forEach(function(elem) {
            var $this = $(elem);
            var swiperContainers = $this.find('.swiper-container');
            var styleCssText  = elem.style.cssText;
            var prop = {
                display: 'block',
                position: 'absolute',
                left: '-10000px'
            };
             // 显示dom后重新计算dom的样式
            for (var key in prop) {
                if (prop.hasOwnProperty(key)) {
                    elem.style[key] = prop[key];
                }
            }

            swiperContainers.forEach(function(elem){
                (new Swiper(elem, {
                   scrollbar: ".swiper-scrollbar",
                direction: "horizontal",
                slidesPerView: 'auto',
                freeMode: true,
              
                }));

            });

            // 重置样式
            if (styleCssText.length > 0) {
                elem.style.cssText = styleCssText;
            } else {
                elem.removeAttribute('style');
            }

        });*/


    }


}

function render() {
     if (_.isEmpty(params.id)) {
        console.log('roomid值异常！');
        return;
    }
    $(function() {
        getPKTeamInfo({roomid: params.id}, function(resp, status, xhr) {
            if (200 !== resp.status) return;
            root.append(template(resp));
            bindEvent(resp);
        });
    });
}

module.exports = {
    render: render
};