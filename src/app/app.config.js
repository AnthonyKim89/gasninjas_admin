(function(angular, undefined) {
  angular.module("GasNinjasAdmin.constants", [])

  .constant("appConfig", {
    "userRoles": [
      "guest",
      "user",
      "admin"
    ],
    "SERVER_URL": window.SERVER_URL,
    "API_URL": window.API_URL,
  });

})(angular);
