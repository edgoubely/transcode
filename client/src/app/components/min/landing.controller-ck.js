function HomeCtrl(e,o){function r(e){for(var o=0,r=a.length;r>o;o++)a[o].id=e.pop()}function n(){for(var e=[],o=0;i>o;++o)e[o]=o;return t(e)}function t(e){var o,r,n=e.length;if(n)for(;--n;)r=Math.floor(Math.random()*(n+1)),o=e[r],e[r]=e[n],e[n]=o;return e}e.myInterval=5e3,e.noWrapSlides=!1,e.active=0;var a=e.slides=[],i=0;e.addSlide=function(){a.push({image:"images/image"+(i+1)+".jpg",text:["Listen your beloved musics","Convert all your videos","And that, on every devices!"][a.length%4],id:i++})},e.randomize=function(){var e=n();r(e)};for(var l=0;3>l;l++)e.addSlide()}angular.module("Transcode").controller("HomeCtrl",HomeCtrl),HomeCtrl.$inject=["$scope","$http"];