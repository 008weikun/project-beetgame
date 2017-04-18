require('components/sui/index');
var Swiper = require('swiper');

var CUR_CLASS = 'current';

$(function(){
	// 标签页联动效果
	var tabsZeptoObject = $('#J_tabs');

	var contentSwiper = new Swiper('#J_content', {
		scrollbar: '.swiper-scrollbar',
		scrollbarHide: false,
		onInit: resetTabSatus,
		onSlideChangeEnd: resetTabSatus
	});

	function resetTabSatus(swiper){
		var slideIndex = swiper.activeIndex;
		tabsZeptoObject.find('.tabs-item').removeClass(CUR_CLASS).eq(slideIndex).addClass(CUR_CLASS);
	}

	tabsZeptoObject.on('click', '.tabs-item', function(){
		var $this = $(this),
			index = $this.index();
		contentSwiper.slideTo(index);
	});
});