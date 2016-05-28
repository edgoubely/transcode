angular.module('Transcode')
	.directive('tcConfirmDialog', ['$uibModal', function($uibModal) {
		return {
			scope: {
				tcConfirmIf: '&',
				tcDo: '&' 
			},
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
	}]);