require('./index.less');
require('./helper');
var $ = require('zepto');
var _ = require('lodash');
var url = require('url-lib');
var Swiper = require('swiper/dist/js/swiper.min');
var template = require('./index.hbs');
var templatePlayerItem = require('./playerList/item.hbs');
var templateLineUp = require('./lineup/index.hbs');
var templateLineUpItem = require('./lineup/item.hbs');
var templateSubmitConfirm = require('./submitConfirm/index.hbs');
var token = require('components/base/js/token');
var avatar = require('components/ui/images/avatar/avatar2.png');

var params = url.parseQuery(location.href);
var root = $('#J_content .swiper-slide').eq(0);
var role = '';
var salary = 0;
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

var roles = {
    'up': null, 
    'adc': null,
    'mid': null, 
    'wild': null, 
    'assis': null
};

/**
 * 获取当前玩家角色
 */
function getRole() {
    return role;
}

/**
 * 设置当前玩家角色
 * @param {String} value 
 */
function setRole(value) {
    if (roleDict.hasOwnProperty(value)) {
        role = value;
        return role;
    } 
}

/**
 * 清除角色的玩家id
 * @param {String} role 
 */
function clearRolePlayerId(role){
    if ( roles.hasOwnProperty(role) ) {
        roles[role] = null;
        return true;
    }
    return false;
}

/**
 * 清除所有角色的玩家id
 */
function clearAllRolesPlayerId() {
    for (var key in roles) {
        clearRolePlayerId(key);
    }
}

/**
 * 判断所有角色的玩家id是否全部为空
 */
function isAllRolesPlayerIdEmpty() {
    for (var key in roles) {
        if (roles.hasOwnProperty(key) && !!roles[key]) {
            return false;
        };
    }
    return true;
}

/**
 * 判断所有角色的玩家id是否都被赋值
 */
function isAllRolesPlayerIdFull() {
     for (var key in roles) {
        if (roles.hasOwnProperty(key) && !!!roles[key]) {
            return false;
        };
    }
    return true;
}

/**
 * 获取角色的玩家id
 * @param {String} role 
 */
function getRolePlayerId(role) {
  if ( roles.hasOwnProperty(role) ) {
        return roles[role];
    }
    return null;
}

/**
 * 设置角色的玩家id
 * @param {String} role 
 * @param {String Number} id 
 */
function setRolePlayerId(role, id) {
     if ( roles.hasOwnProperty(role) ) {
        return roles[role] = id;
    }
}

/**
 * 设置所有角色的玩家id
 * @param {Object} data 
 */
function setAllRolePlayerId(data) {
    for (var key in data) {
        if (!data.hasOwnProperty(key)) continue;
        setRolePlayerId(key, data[key].playerid);
    }
}

/**
 * 获取玩家信息
 * @param {Object} data ajax返回的数据
 * @param {String} role 角色
 * @param {String Number} id 玩家id
 */
function getPlayerInfo(data, role, id) {
    var arr = null;
    var playerInfo = null;
    if (_.isArray(data[role])) {
        arr = data[role].slice();
        arr.forEach(function(value){
            if (id == value.playerid) {
                playerInfo = value;
                return false;
            }
        });
    }

    if (_.isPlainObject(data[role])) {
        playerInfo = _.merge({}, data[role]);
    }

    return playerInfo;
}

/**
 * 初始化薪金总额度用来后期运算
 * @param {Object} data ajax请求返回的数据
 */
function initSalary(data) {
    var salary = data.money*1
    var players = data.data;
    var tmp = null;
    for (var key in roles) {
        if (!roles.hasOwnProperty(key)) continue;
        tmp = getPlayerInfo(players, key, roles[key]);
        if (tmp) {
            salary += tmp.price*1;
        }
    }
    return salary;
}

/**
 * 计算薪金
 * @param {Object} data ajax请求返回的数据
 */
function calcSalary(data) {
    var tmp = null;
    var s = salary;
    for (var key in roles) {
        if (!roles.hasOwnProperty(key)) continue;
        tmp = getPlayerInfo(data, key, roles[key]);
        if (tmp) {
            s -= tmp.price*1;
        }
    }
    return s;
}

/**
 * 计算所有角色的fan值得总值
 */
function calcFanValue(data) {
    var value = 0;
    for (var key in roles) {
        if (roles.hasOwnProperty(key) && !!roles[key]) {
            value += getPlayerInfo(data, key, roles[key]).fan;
        };
    }
    return value.toFixed(2);
}

/**
 * 生成请求的参数对象
 * @return {Object}  
 */
function generateRequestParamsObject() {
    var obj = {
        userplayers: [],
        client: 'wx'
    };
    for (var key in roles) {
        if (roles.hasOwnProperty(key) && !!roles[key]) {
           obj.userplayers.push({
               playerid: roles[key],
               position: roleDict[key],
               roomid: params.id
           });
        };
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
 * 获取一键阵容信息
 * @param {Object} data 
 * @param {Function} callback 
 */
function getQuickLineUpInfo(data, callback) {
	if (!(_.isPlainObject(data) && _.isFunction(callback))) return;
	$.ajax({
		type: 'GET',
		url: '/api/fantasy/formation',
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
 * 清洗一键阵容ajax请求的数据
 * @param {*} data 
 */
function washQuickLineUpRespData(data) {
      var obj = _.merge({}, data);
      var tmp = {};
      if (_.isArray(obj.data)) {
          obj.data.forEach(function (value) {
              tmp[value.tab] = value;
          });
          obj.data = tmp;
          return obj;
      }
      return false;
}

/**
 * 提交阵容
 * @param {*} data 
 * @param {*} callback 
 */
function postLineUp(data, callback) {
	if (!(_.isPlainObject(data) && _.isFunction(callback))) return;
	$.ajax({
		type: 'POST',
		url: '/api/fantasy/userplayers',
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
    var arr = data.slice();
    if (0 === type) {
        return arr;
    }
    if (1 === type) {
        return arr.sort(function (prev, next) {
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
        return arr.sort(function (prev, next) {
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
    var dataList = data.data;
    var playerId = getRolePlayerId(role);
    var stat = filter.getRoleStat(role);
    var newData = {choosen: {}, data: {} };
    if (!!playerId) {
        newData.choosen[role] = getPlayerInfo(dataList, role, playerId);
    } else {
        newData.choosen[role] = {playerid:null};
    }
    newData.data[role] = sort(dataList[role], stat.field, stat.order);
    root.find('#J_playerList').find('[data-role="'+ role + '"]').html(templatePlayerItem(newData));    
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
        // observer:true,
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
    return playerPickerSwiper;
}

/**
 * 渲染轮播图卡牌
 * @param {*} role 玩家角色
 * @param {*} playerInfo 玩家信息
 */
function renderSwiperSlide(role, playerInfo) {
    var playerId = getRolePlayerId(role);
    var swiperContainer = $('#J_playerPickerSwiper');
    var slides = swiperContainer.find('[data-role="' + role +'"]');
    if (!playerId) {
        slides.find('.player-avatar img').attr('src', avatar);
        slides.find('.player-name').html('选择队员');            
        return;
    }
    slides.find('.player-avatar img').attr('src', playerInfo.avatar).
        on('error', function name(event) { // 如果图片不能正常加载就载入默认图片
            $(this).attr('src', avatar);
        });
    slides.find('.player-name').html(playerInfo.name);
}

/**
 * 渲染轮播图所有的卡牌
 * @param {*} roles 所有角色,代码头部有对其声明
 * @param {*} data  所有的玩家数据
 */
function renderAllSwiperSlides(roles, data) {
    for (var key in roles) {
        if (roles.hasOwnProperty(key)) {
            addOrRemoveRolePlayer(key, roles[key], data);
        }
    }
}

/**
 * 
 * @param {*} role 角色
 * @param {*} playerId 玩家id
 * @param {*} data 玩家数据
 */
function addOrRemoveRolePlayer(role, playerId, data) {

    var SELECTOR_BUTTON = '.player-choose-btn span';
    var SELECTOR_ROLE   = '[data-role="' + role + '"]';
    var SELECTOR_PLAYER = '[data-playerid="'+ playerId + '"]';
    var CLASSNAME_MINUS = 'card-icon-minus';
    var CLASSNAME_PLUS  = 'card-icon-plus';

    var playerList = $('#J_playerList');
    var buttons = playerList.find(SELECTOR_ROLE).find(SELECTOR_BUTTON);
    var currButton = playerList.find(SELECTOR_ROLE).find(SELECTOR_PLAYER).find(SELECTOR_BUTTON);
    var oldPlayerId = getRolePlayerId(role);
    var oldPlayerInfo = getPlayerInfo(data, role, oldPlayerId);
    var oldPlayerPrice = !!oldPlayerInfo ? oldPlayerInfo.price*1 : 0;
    var playerInfo  = null;


    if ( playerId != oldPlayerId) { 
        playerInfo = getPlayerInfo(data, role, playerId);
        if (calcSalary(data) + oldPlayerPrice - playerInfo.price*1 < 0 ) {
            $.alert('薪金余额不足！')
            return;
        }
        setRolePlayerId(role, playerId);
        renderSwiperSlide(role, playerInfo);
        buttons.removeClass().addClass(CLASSNAME_PLUS);
        currButton.removeClass().addClass(CLASSNAME_MINUS);

    } else {
        clearRolePlayerId(role);
        renderSwiperSlide(role);
        if ( null == oldPlayerId ) {
            buttons.removeClass().addClass(CLASSNAME_PLUS);
        } else {
            currButton.removeClass().addClass(CLASSNAME_PLUS);
        }
    }
    $('#J_purse').html(calcSalary(data));
}

/**
 * 提交阵容询问弹框
 */
function submitConfirm(data) {
    var flag = isAllRolesPlayerIdFull();
    if (!flag) {
        $.alert('玩家人数不够！');
        return;
    }
    $.modal({
        extraClass: 'custom-modal1',
        text: templateSubmitConfirm({
                    total: calcFanValue(data),
                    fee: params.jcost
                })
    });
}

/**
 * 提交阵容
 */
function submit() {
    var flag = isAllRolesPlayerIdFull();
    var data = null;

    if (!flag) {
        $.alert('玩家人数不够！');
        return;
    }
    
    data = generateRequestParamsObject();
    data.userplayers =  JSON.stringify(data.userplayers);

    postLineUp(data, function(resp, status, xhr){
        var status = resp.status;
        if (200 !== status) {
            $.closeModal(); $.alert(resp.errorMsg);
            return;
        }
        // 页面跳转        
    });
}

/**
 * 事件绑定
 * @param {Object} data 房间信息
 */
function bindEvent(data) {

    var swiper = bootSwiper();
    
    if (1 == params.isJoined) {
        setAllRolePlayerId(data.choosen);
    }

    salary = initSalary(data);

    // 清空
    root.on('click', '#J_clean', function (event) {
        if (isAllRolesPlayerIdEmpty()) {
            return;
        }
        clearAllRolesPlayerId();
        renderAllSwiperSlides(roles, data.data);
    });

    // 一键阵容
    root.on('click', '#J_quickLineUp', function (event) {
        getQuickLineUpInfo({id: params.id}, function(resp, status, xhr){
            var newData = null;
            var lineup  = null;
            var roles = {};
            if (resp.status != 200) {return;}
            newData = washQuickLineUpRespData(resp);
            lineup  = newData.data;
            $.modal({
                extraClass: 'custom-modal',
                text: templateLineUp(newData)
            });
            for(var key in lineup) {
                if (lineup.hasOwnProperty(key)) {
                    roles[key] = lineup[key].playerid;
                }
            }
            clearAllRolesPlayerId();
            renderAllSwiperSlides(roles, lineup);
        });
    });

    $(document).on('click', '#J_lineupMore', function (event) {
        var $this = $(this);
        var parent = $this.parent('.lineup-btns');
        getQuickLineUpInfo({id: params.id}, function(resp, status, xhr){
            var newData = null;
            var lineup  = null;
            var roles = {};
            if (resp.status != 200) {return;}
            newData = washQuickLineUpRespData(resp);
            lineup  = newData.data;
            parent.siblings('.lineup-inner-wrap').html(templateLineUpItem(newData));
            for(var key in lineup) {
                if (lineup.hasOwnProperty(key)) {
                    roles[key] = lineup[key].playerid;
                }
            }
            clearAllRolesPlayerId();
            renderAllSwiperSlides(roles, lineup);
        });
    });

    // 关闭弹框
    ['.btn-close', '#J_cancel'].forEach(function(selector){
        $(document).on('click', selector, function (event) {$.closeModal();});
    });

    // 提交阵容
    root.on('click', '#J_submitLineUp', function (event) {
        submitConfirm(data.data);
    });

    $(document).on('click', '#J_lineupSubmit', function (event) {
        if ($('.custom-modal').length > 0) {
            $.closeModal('.custom-modal');
        }
        submitConfirm(data.data);
    });

      $(document).on('click', '#J_submit', function (event) {
        submit();
     });

    // 排序
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

    // 选择队员
    root.on('click', '#J_playerList .player-choose-btn span', function (event) {
        var role = getRole();
        var $this = $(this);
        var parent = $this.parents('.player');
        var playerId = parent.data('playerid');
        addOrRemoveRolePlayer(role, playerId, data.data);
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
            bindEvent(resp);
        });
    });
}

module.exports = {
    render: render
};