/* js/api.js — fetch wrapper for the Netlify Functions backend.
 * Base "" works on Netlify via netlify.toml redirect /api/* -> function.
 * Token persisted in localStorage "x_token". */
(function (App) {
  "use strict";

  function token() { return localStorage.getItem("x_token"); }

  async function req(method, path, body) {
    var headers = { "Content-Type": "application/json" };
    var t = token();
    if (t) headers["Authorization"] = "Bearer " + t;
    var res;
    try {
      res = await fetch(path, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      var netErr = new Error("cannot reach server — is the backend deployed?");
      netErr.status = 0;
      throw netErr;
    }
    var data = null;
    try { data = await res.json(); } catch (e) { /* empty body */ }
    if (!res.ok) {
      var err = new Error((data && data.error) || ("request failed (" + res.status + ")"));
      err.status = res.status;
      throw err;
    }
    return data;
  }

  App.api = {
    get: function (p) { return req("GET", p); },
    post: function (p, b) { return req("POST", p, b); },
    del: function (p) { return req("DELETE", p); },
    token: token,
    setToken: function (t) {
      if (t) localStorage.setItem("x_token", t);
      else localStorage.removeItem("x_token");
    },
  };
})(window.App);
