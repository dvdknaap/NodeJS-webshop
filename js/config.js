requirejs.config({
  //By default load any module IDs from js/lib
  baseUrl: './',
  //except, if the module ID starts with "app",
  //load it from the js/app directory. paths
  //config is relative to the baseUrl, and
  //never includes a ".js" extension since
  //the paths config could be for a directory.
  paths: {
    mainApp: './js/webshop',
    jquery: './bower_components/jquery/dist/jquery.min',
    bootstrap: './bower_components/bootstrap/dist/js/bootstrap.min',
    angular: './bower_components/angular/angular.min',
  }
});

require(['mainApp']);