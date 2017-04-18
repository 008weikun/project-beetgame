require('./index.less');
require('./helper');
var $ = require('zepto');
var _ = require('lodash');
var url = require('url-lib');
var template = require('./index.hbs');
var templatePlayerItem = require('./playerList/item.hbs');
var token = require('components/base/js/token');

var params = url.parseQuery(location.href);
var root = $('#J_content .swiper-slide').eq(0);
var role = '';
var roleDict = {adc: 'ADC', assis: '辅助', mid: '中单', up: '上单', wild: '打野'};
var filterBarIcons = ['arrow-icon-default', 'arrow-icon-down', 'arrow-icon-up'];
var filterBarFieldSelector = {
    fan: '#J_filterFansvalue span',
    price: '#J_filterForegift span',
    pickPercent: '#J_filterRate span'
};

var filter = ({
    order: [0, 1, 2], // 0默认 1升序 2降序
    fields: ['fan', 'price', 'pickPercent'],
    roles: ['up', 'adc', 'mid', 'wild', 'assis'],
    store: {},
    init: function(){
        this.setStore();
        return this;
    },
    setStore: function() {
        var type = this.type;
        var store = this.store;
        var roles = this.roles;
        roles.forEach(function(value){
            store[value] = {
                field: '',
                order: 0
            }
        });
    },

    getRoleStat: function(role){
        var store = this.store;
        if (!store.hasOwnProperty(role)) {
            console.log('选手角色字段异常！');
            return;
        }
        return store[role];

    },

    setRoleStat: function(role, field){
        var store = this.store;
        var roles = this.roles;
        var fileds = this.fields;
        if ( roles.indexOf(role) == -1 || fileds.indexOf(field) == -1 ) {
            console.log('选手角色或过滤字段异常！');
            return;
        }
        var oldField = store[role].field;
        var oldOrder = store[role].order;

        if ( field === oldField ) {
            store[role].order = (oldOrder+1)%this.order.length;
        } else {
            store[role].field = field;
            store[role].order = 1;
        }
    }
}).init();

/**
 * 获取玩家角色
 */
function getRole() {
    return role;
}
/**
 * 设置玩家角色
 * @param {String} value 
 */
function setRole(value) {
    if (roleDict.hasOwnProperty(value)) {
        role = value;
        return role;
    } 
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

/**
 * 清洗ajax请求的返回值
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
 * hackSwiper
 * @param  {Object} swiper
 */
function hackSwiper(swiper) {
    var slides = [].slice.call(swiper.slides);
    var activeIndex = swiper.activeIndex;
    //  兼容设计
    slides.forEach(function(dom, index, arr) {
        if (index < activeIndex - 2 || index > activeIndex + 2) {
            dom.style.visibility = "hidden";
        } else {
            dom.style.visibility = "inherit";
        }
    });
    // 设置玩家角色
    setRole($(slides[activeIndex]).find('.player-card').data('role'));
}

/**
 * 设置过滤条左侧玩家角色的名称
 */            
function setFilterBarPlayerRoleName() {
    var role = getRole();
    root.find('#J_role').attr('data-role', role).html(roleDict[role]);
}
/**
 * 玩家列表的联动效果
 */
function togglePlayerList() {
    var role = getRole();
    var playerList = root.find('#J_playerList');
    playerList.find('.player-list-item').hide();
    playerList.find('[data-role="' + role + '"]').show();
}

/**
 * 玩家列表本地排序，可节省服务器资源
 * @param {Object} data 
 * @param {String} key 
 * @param {Number} type 0 默认排序 1 升序 2 降序
 */
function sort(data, key, type) {
    var obj = data.slice();
    if (0 === type) {
        return obj;
    }
    if (1 === type) {
        return obj.sort(function (prev, next) {
            if ( parseFloat(prev[key]) > parseFloat(next[key]) ) {
                return 1;
            } 
            if ( parseFloat(prev[key]) < parseFloat(next[key]) ) {
                return -1;
            } 
            return 0;
        });
    }
    if (2 === type) {
        return obj.sort(function (prev, next) {
            if ( parseFloat(prev[key]) > parseFloat(next[key]) ) {
                return -1;
            }
            if ( parseFloat(prev[key]) < parseFloat(next[key]) ) {
                return 1;
            }
            return 0;
        });
    }
}

/**
 * 更新filterBar小图标
 */
function updateFilterBarIcon() {
    var stat = filter.getRoleStat(getRole());
    var field = stat.field;
    field.length > 0 && $(filterBarFieldSelector[field]).removeClass()
                        .addClass(filterBarIcons[stat.order]);
    for (var i in filterBarFieldSelector) {
        if (i == field) continue;
        $(filterBarFieldSelector[i]).removeClass().addClass(filterBarIcons[0]);
    }
}

/**
 * 渲染排序后的玩家列表
 * @param {*} data 
 */
function renderPlayerListItem(data) {
    var role = getRole();
    var stat = filter.getRoleStat(role);
    var dataList = data.data;
    var newData = {choosen: data.choosen, data: {}};
    newData.data[role] = sort(dataList[role], stat.field, stat.order);
    root.find('#J_playerList').find('[data-role="'+ role + '"]').html(templatePlayerItem(newData));    
}

/**
 * 事件绑定
 * @param {Object} data 房间信息
 */
function bindEvent(data) {

    root.on('click', '#J_clean', function (event) {
    
    });

    root.on('click', '#J_quickLineUp', function (event) {
        
    });

    root.on('click', '#J_submitLineUp', function (event) {
        
    });

    root.on('click', '#J_filterFansvalue', function (event) {
        filter.setRoleStat(getRole(),'fan');
        updateFilterBarIcon();
        renderPlayerListItem(data);
    });

    root.on('click', '#J_filterForegift', function (event) {
        filter.setRoleStat(getRole(),'price');
        updateFilterBarIcon();
        renderPlayerListItem(data);
    });

    root.on('click', '#J_filterRate', function (event) {
        filter.setRoleStat(getRole(),'pickPercent');
        updateFilterBarIcon();
        renderPlayerListItem(data);
    });

    root.on('click', '#J_playerList .player-choose-btn span', function (event) {
        
    });
}

/**
 * 创建coverflow效果
 */
function bootSwiper() {
    var timer = null;
    var playerPickerSwiper = new Swiper('#J_playerPickerSwiper', {
        initialSlide: 2,
        slideToClickedSlide: true,
        centeredSlides: true,
        loop: true,
        slidesPerView: "auto", 
        loopedSlides: 5,
        observer:true,
        effect: "coverflow",
        coverflow: {
            rotate: 0,
            stretch: 15,
            depth: 400,
            modifier: 1,
            slideShadows: false,
        },
        onInit: function(swiper){
            hackSwiper(swiper);
            setFilterBarPlayerRoleName();
            togglePlayerList();
        },
        onSetTranslate: function(swiper) {
            hackSwiper(swiper);
            timer && clearTimeout(timer);
            timer = setTimeout(function() { 
                setFilterBarPlayerRoleName();
                togglePlayerList();
                updateFilterBarIcon();
            }, 100);
        },
    }); 
}

function render(){
    if (_.isEmpty(params.id)) {
        console.log('roomid值异常！');
        return;
    }
    $(function() {
        getRoomInfo({roomid: params.id}, function(resp, status, xhr) {
            if (200 !== resp.status) return;
            resp = washRespData(resp, params.isJoined);
            root.append(template(resp));
            bootSwiper();
            bindEvent(resp);
        });
    });
}

[render].forEach(function(value) {
	module.exports[value.name] = value;
});