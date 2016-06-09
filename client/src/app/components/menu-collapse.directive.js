angular.module('Transcode').directive('tcMenuCollapse', ['$animate',
    function ($animate) {
        return {
            link: function (scope, elem, attrs) {
                elem.on('click', function () {
                
            		var menuByID = document.getElementsByClassName("nav-menu");
                    var menu = angular.element(menuByID);
                    menu.addClass("menu-appears");
               
            		var menuFilterByID = document.getElementsByClassName("nav-filter");
                    var menuFilter = angular.element(menuFilterByID);
                    menuFilter.addClass("filter-appears");
                });
            }
        };
}]);

angular.module('Transcode').directive('tcMenuHide', ['$animate',
    function ($animate) {
        return {
            link: function (scope, elem, attrs) {
                elem.on('click', function () {
                
            		var menuByID = document.getElementsByClassName("nav-menu");
                    var menu = angular.element(menuByID);
                    menu.removeClass("menu-appears");
               
            		var menuFilterByID = document.getElementsByClassName("nav-filter");
                    var menuFilter = angular.element(menuFilterByID);
                    menuFilter.removeClass("filter-appears");
                });
            }
        };
}]);