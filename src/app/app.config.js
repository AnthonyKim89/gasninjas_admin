(function(angular, undefined) {
  angular.module("GasNinjasAdmin.constants", [])

  .constant("appConfig", {
    "userRoles": [
      "driver",
      "admin",
      "superadmin"
    ],
    "SERVER_URL": window.SERVER_URL,
    "API_URL": window.API_URL,
  });

})(angular);
