/*angular.module('Transcode')
	.directive('tcMenuColapse', ['$uibModal', function($uibModal) {
		return {
			restrict: 'A',
			link: function($scope, element, attrs) {
				
				element.bind('click', function() {
					if ($scope.tcConfirmIf()) {	
						var confirmationDialog = $uibModal.open({
		    			backdrop: false,
		    			templateUrl: attrs.templateUrl || 'template/modal/confirmation-dialog.tpl.html',
		    			windowTemplateUrl: attrs.windowTemplateUrl || 'template/modal/window.html',
		    			size: 'sm'
		    		});

		    		confirmationDialog.result.then(function(isConfirmed) {
		    			if (isConfirmed)
		    				$scope.tcDo(); 
						});
		    	} else {
		    		$scope.tcDo(); 
		    	}
				});
			}
		};
	}]);*/
	
angular.module('Transcode').directive('tcMenuCollapse', ['$animate',
    function ($animate) {
        return {
            link: function (scope, elem, attrs) {
            	console.log("YOOOOO");
                elem.on('click', function () {
                    var self = angular.element(this);
                    $animate.addClass(self, 'spin', function () {
                        self.removeClass('spin');
                    });
                });
            }
        };
}]);
	
	
/*angular.module('Transcode')
	.directive('tcMenuColapse', ['$animate', function ($animate) {
        return {
            link: function (scope, elem, attrs) {
                elem.on('click', function () {
                    //var self = angular.element(this);
                    
                    //console.log("YO")
                    
                    var self = angular.element("#menu");
                    $animate.addClass(self, 'spin', function () {
                        self.removeClass('spin');
                    });
                });
            }
        };
}]);*/