(function() {
  'use strict';

  var URL_REGEXP = new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i');

  angular
    .module('Transcode')
    .directive('tcUrl', tcUrl);

  tcUrl.$inject = [];

  function tcUrl() {
    var directive = {
      require: 'ngModel',
      link: link,
      restrict: 'A'
    };
    return directive;

    function link(scope, element, attrs, ctrl) {
      ctrl.$validators.url = function(modelValue, viewValue) {
        return !ctrl.$isEmpty(modelValue) && viewValue.length < 2083 && URL_REGEXP.test(viewValue);
      };
    }
  }
})();