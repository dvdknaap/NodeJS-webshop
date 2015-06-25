'use strict';

(function() {

	angular.module('webshopApp', [
		'ui.router', 'ngCookies'
	])
	.constant('MyAppName', 'Mij sexshop')
	.config(['$urlRouterProvider', '$stateProvider', '$locationProvider', function ($urlRouterProvider, $stateProvider, $locationProvider) {
		$urlRouterProvider.otherwise('/');

		$stateProvider
		.state('home', {
			pageName: 'Home',
			url: '/',
			templateUrl: 'views/home.html',
			controller: 'homeCtrl',
			controllerAs: 'HomePage'
		})
		.state('dildo', {
			pageName: 'Dildo\'s',
			url: '/dildo.html',
			templateUrl: 'views/dildo.html',
			controller: 'dildoCtrl',
			controllerAs: 'DildoPage'
		})
		.state('diversen', {
			pageName: 'Diversen',
			url: '/diversen.html',
			templateUrl: 'views/diversen.html',
			controller: 'diversenCtrl',
			controllerAs: 'DiversenPage'
		})
		.state('kledingVoorHaar', {
			pageName: 'Kleding voor haar',
			url: '/kleding-voor-haar.html',
			templateUrl: 'views/kleding-voor-haar.html',
			controller: 'kledingVoorHaarCtrl',
			controllerAs: 'KledingVoorHaarPage'
		})
		.state('kledingVoorHem', {
			pageName: 'Kleding voor hem',
			url: '/kleding-voor-hem.html',
			templateUrl: 'views/kleding-voor-hem.html',
			controller: 'kledingVoorHemCtrl',
			controllerAs: 'KledingVoorHemPage'
		})
		.state('toysVoorDames', {
			pageName: 'Toys voor dames',
			url: '/toys-voor-dames.html',
			templateUrl: 'views/toys-voor-dames.html',
			controller: 'ToysVoorDamesCtrl',
			controllerAs: 'ToysVoorDamesPage'
		})
		.state('drogisterij', {
			pageName: 'Drogisterij',
			url: '/drogisterij.html',
			templateUrl: 'views/drogisterij.html',
			controller: 'drogisterijCtrl',
			controllerAs: 'DrogisterijPage'
		})
		.state('vibrator', {
			pageName: 'Vibrator',
			url: '/vibrator.html',
			templateUrl: 'views/vibrator.html',
			controller: 'vibratorCtrl',
			controllerAs: 'VibratorPage'
		})
		;


    $locationProvider.html5Mode(true);
	}])
	.run(['$state', '$rootScope', '$document', 'MyAppName', function($state, $rootScope, $document, MyAppName) {
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {

			$document[0].title = toState.pageName+' - '+MyAppName;

			$rootScope.pageClass = 'page-'+toState.pageName.toLowerCase();
    });
	}])
	.service('$webshopClass', ['$rootScope', function ($rootScope) {

		return {
			hideLoading: function () {
				$rootScope.loading = false;
			},
			showLoading: function () {
				$rootScope.loading = true;
			}			
		};
	}])
	.controller('mainCtrl', ['$rootScope', '$scope', '$location', '$webshopClass', function ($rootScope, $scope, $location, $webshopClass) {

		var menuItems = [
			{
				'url'  : 'dildo.html',
				'name' : 'dildo\'s'
			},
			{
				'url'  : 'diversen.html',
				'name' : 'diversen'
			},
			{
				'url'  : 'kleding-voor-haar.html',
				'name' : 'kleding voor haar'
			},
			{
				'url'  : 'kleding-voor-hem.html',
				'name' : 'kleding voor hem'
			},
			{
				'url'  : 'toys-voor-dames.html',
				'name' : 'toys voor dames'
			},
			{
				'url'  : 'drogisterij.html',
				'name' : 'drogisterij'
			},
			{
				'url'  : 'vibrator.html',
				'name' : 'vibrator'
			}
		];

		// somewhere else
		$rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams){ 
		  console.log(unfoundState.to); // "lazy.state"
		  console.log(unfoundState.toParams); // {a:1, b:2}
		  console.log(unfoundState.options); // {inherit:false} + default options
			console.info(arguments, '$stateNotFound');
		});

		// somewhere else
		$rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error){

			console.info(arguments, '$stateChangeError');
		});

		// somewhere else
		$rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){

			//console.info(arguments, '$stateChangeSuccess');
		});

		// somewhere else
		$rootScope.$on('$viewContentLoading', function(event, viewConfig){

			//console.info(arguments, '$viewContentLoading');
		});

		$webshopClass.showLoading();

		// Set the loading variable
		// Set backButton to false
		$rootScope.$on("$routeChangeStart", function(event, next, current) {
			$webshopClass.showLoading();		
		});

		//Add current page class to ng-view
		var changePageClass = function changePageClass() {
		  var pagePrefix = 'page-';

		  //Replace old pagePrefix
		  $('ng-view').addClass(function (index, currentClass) {
		    var regx = new RegExp('\\b' + pagePrefix + '.*?\\b', 'g');
		    return currentClass.replace(regx, '');
		  });

		  var pageClass = pagePrefix+$location.path().split('/')[1];
		  
		  //Set new pageprefix
		  $('ng-view').addClass(pageClass);
		};


		$rootScope.$on("$viewContentLoaded", function(event, next, current) {
			changePageClass();
		});
	}])
	.controller('homeCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('homeCtrl');

		$webshopClass.hideLoading();		
	}])
	.controller('dildoCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('dildoCtrl');
		$webshopClass.hideLoading();
	}])
	.controller('diversenCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('diversenCtrl');
		$webshopClass.hideLoading();
	}])
	.controller('kledingVoorHaarCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('kledingVoorHaarCtrl');
		$webshopClass.hideLoading();
	}])
	.controller('kledingVoorHemCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('kledingVoorHemCtrl');
		$webshopClass.hideLoading();
	}])
	.controller('ToysVoorDamesCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('ToysVoorDamesCtrl');
		$webshopClass.hideLoading();
	}])
	.controller('drogisterijCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('drogisterijCtrl');
		$webshopClass.hideLoading();
	}])
	.controller('vibratorCtrl', ['$rootScope', '$scope', '$webshopClass', function ($rootScope, $scope, $webshopClass) {
		console.info('vibratorCtrl');
		$webshopClass.hideLoading();
	}])
	;

	$(document).ready(function() {

		var mustBe       = $('.navbar').offset().top+$('.navbar').height();
		var headerScroll = $('.headerScroll');

		$(document).scroll(function (event) {

			if ($(this).scrollTop() > mustBe) {
				headerScroll.slideDown();
			} else if ($(this).scrollTop() < mustBe) {
				headerScroll.slideUp();
			}
		});

		$('[scrollToTop]').click(function () {
			$('body,html').animate({scrollTop:0},500);
		});

		$(document).scroll();
	});

})();
