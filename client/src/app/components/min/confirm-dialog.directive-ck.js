angular.module("Transcode").directive("tcConfirmDialog",["$uibModal",function(t){return{scope:{tcConfirmIf:"&",tcDo:"&"},restrict:"A",link:function(e,o,l){o.bind("click",function(){if(e.tcConfirmIf()){var o=t.open({backdrop:!1,templateUrl:l.templateUrl||"template/modal/confirmation-dialog.tpl.html",windowTemplateUrl:l.windowTemplateUrl||"template/modal/window.html",size:"sm"});o.result.then(function(t){t&&e.tcDo()})}else e.tcDo()})}}}]);