angular.module("Transcode",["ui.bootstrap.carousel"]).controller("CarouselDemoCtrl",function(o){function r(o){for(var r=0,e=a.length;e>r;r++)a[r].id=o.pop()}function e(){for(var o=[],r=0;n>r;++r)o[r]=r;return t(o)}function t(o){var r,e,t=o.length;if(t)for(;--t;)e=Math.floor(Math.random()*(t+1)),r=o[e],o[e]=o[t],o[t]=r;return o}o.myInterval=5e3,o.noWrapSlides=!1,o.active=0;var a=o.slides=[],n=0;o.addSlide=function(){var o=600+a.length+1;a.push({image:"http://lorempixel.com/"+o+"/300",text:["Nice image","Awesome photograph","That is so cool","I love that"][a.length%4],id:n++})},o.randomize=function(){var o=e();r(o)};for(var i=0;4>i;i++)o.addSlide()});