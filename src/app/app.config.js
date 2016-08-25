(function(angular, undefined) {
  angular.module("GasNinjasAdmin.constants", [])

  .constant("appConfig", {
  	"userRoles": [
  		"guest",
  		"user",
  		"admin"
  	]
  });
  
})(angular);