var Zabbix = function(host, user, pass, opts) {
  var vm = this;
  if (typeof opts == "undefined") {
    opts = {debug: false};
  }
  vm._opts = opts;
  vm._init(host);
  //vm._login(user, pass);
};
  
Zabbix.prototype = {
  _req: function(body, cb) {
    var vm = this,
        xhr = new XMLHttpRequest();

    xhr.open("POST", vm._host);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        cb(JSON.parse(xhr.responseText));
      } else if (xhr.readyState === XMLHttpRequest.DONE && xhr.status == 500) {
        cb({"error": { "code": 500, "msg": xhr.responseText}});
      }
    };
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(body));
    return;
  },
  api: function(method, params, cb) {
    var vm = this;
    var req = {};

    req.jsonrpc = "2.0";
    req.method = method;
    req.params = params;
    req.auth = vm._isauth ? vm._token : null;
    req.id = vm._reqid++;
    vm._req(req, cb);
  },
  _init: function(host) {
    var vm = this;
    vm._reqid = 0;
    vm._isauth = false;
    vm._token = "";
    vm._host = host;
    vm._ready = false;
    vm._queued = [];
  },
  login: function(user, pass, cb) {
    var vm = this;
    vm._user = user;
    vm.api("user.login", {"user": user, "password": pass}, function(data) {
      if (!data.hasOwnProperty("error")) {
        vm._isauth = true;
	vm._token = data.result;
	vm._ready = true;
	cb();
      }
    });
  },
  _debug: function(method, params) {
    var vm = this;
    vm.api(method, params, function(d) { console.log(d) });
  }
};
