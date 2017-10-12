(function(angular, undefined) {
  angular.module("GasNinjasAdmin.constants", [])

  .constant("appConfig", {
    "userRoles": [
      "user",
      "B2B",
      "driver",
      "admin",
      "superadmin"
    ],
    "SERVER_URL": window.SERVER_URL,
    "API_URL": window.API_URL,
  });

})(angular);
