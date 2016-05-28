angular
  .module('Transcode')
  .controller('PricingCtrl', PricingCtrl);

PricingCtrl.$inject = ['$scope', 'toastr'];

function PricingCtrl($scope, toastr) {}