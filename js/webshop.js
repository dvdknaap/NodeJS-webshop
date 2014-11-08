$( document ).ready(function() {

	var mustBe       = $('.navbar').offset().top+$('.navbar').height();
	var headerScroll = $('.headerScroll');

	$(document).scroll(function (event) {


		if ($(this).scrollTop() > mustBe) {
			headerScroll.slideDown();
		} else if ($(this).scrollTop() < mustBe) {
			headerScroll.slideUp();
		}
	})

});
