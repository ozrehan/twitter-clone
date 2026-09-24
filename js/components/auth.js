/* components/auth.js — login / signup split screen + new-user onboarding.
 * Rendered instead of the app when no token is present. */
(function (App) {
  "use strict";

  var mode = "signin"; /* signin | signup */

  App.renderAuth = function () {
    document.title = "X";
    document.body.innerHTML =
      '<div class="auth">' +
        '<div class="auth-left">' + App.icon("logo", "logo-fill auth-bird") + "</div>" +
        '<div class="auth-right">' +
          "<h1>Happening now</h1>" +
          "<h2>Join today.</h2>" +
          '<div class="auth-tabs">' +
            '<button class="auth-tab' + (mode === "signin" ? " active" : "") + '" data-amode="signin">Sign in</button>' +
            '<button class="auth-tab' + (mode === "signup" ? " active" : "") + '" data-amode="signup">Create account</button>' +
          "</div>" +
          '<div id="authErr" class="auth-err" style="display:none"></div>' +
          '<form id="authForm">' +
            (mode === "signup"
              ? '<input id="authName" class="auth-input" placeholder="Name" maxlength="50" autocomplete="name">'
              : "") +
            '<input id="authUser" class="auth-input" placeholder="Username" maxlength="20" autocomplete="username">' +
            '<input id="authPass" class="auth-input" type="password" placeholder="Password" autocomplete="current-password">' +
            '<button class="auth-submit" type="submit">' +
              (mode === "signin" ? "Sign in" : "Create account") + "</button>" +
          "</form>" +
          (mode === "signin"
            ? '<p class="auth-hint">Demo logins — username <b>you</b>, password <b>password</b> (or any seeded account).</p>'
            : '<p class="auth-hint">Pick any username. After signup you\'ll choose who to follow.</p>') +
        "</div>" +
      "</div>";

    App.on(document.body, "click", "[data-amode]", function (e, el) {
      mode = el.getAttribute("data-amode");
      App.renderAuth();
    });

    App.$("#authForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var errEl = App.$("#authErr");
      errEl.style.display = "none";
      var username = App.$("#authUser").value.trim();
      var password = App.$("#authPass").value;
      var nameEl = App.$("#authName");
      try {
        var res;
        if (mode === "signin") {
          res = await App.api.post("/api/auth/login", { username: username, password: password });
        } else {
          res = await App.api.post("/api/auth/signup", {
            username: username, password: password,
            name: nameEl ? nameEl.value.trim() : username,
          });
        }
        App.api.setToken(res.token);
        App.store.me = res.user;
        App.store.currentUserId = res.user.username;
        if (res.newUser) App.renderOnboarding();
        else App.bootApp();
      } catch (err) {
        errEl.textContent = err.message;
        errEl.style.display = "block";
      }
    });
  };

  /* new-user onboarding: follow seeded accounts, then enter the app */
  App.renderOnboarding = function () {
    document.title = "Who to follow / X";
    document.body.innerHTML =
      '<div class="onboard">' +
        '<div class="onboard-card">' +
          '<div class="ob-head">' + App.icon("logo", "logo-fill") +
            "<h1>Who to follow</h1><p>Follow accounts to fill your timeline. You can unfollow anytime.</p></div>" +
          '<div id="obList"><div class="ob-loading">Loading accounts…</div></div>' +
          '<button class="auth-submit" id="obDone">Continue</button>' +
        "</div>" +
      "</div>";

    App.api.get("/api/users").then(function (users) {
      var list = users.filter(function (u) { return u.username !== App.store.currentUserId; }).slice(0, 8);
      App.$("#obList").innerHTML = list.map(function (u) {
        return '<div class="ob-row">' +
          '<img src="' + App.avatar(u.seed) + '" alt="">' +
          '<div class="ob-nm"><b>' + App.esc(u.name) + " " + (u.verified ? App.vbadge() : "") + "</b>" +
          "<span>@" + u.handle + " · " + App.fmt(u.followers) + " followers</span></div>" +
          '<button class="follow-btn" data-obfollow="' + u.username + '">Follow</button></div>';
      }).join("");
      App.on(document.body, "click", "[data-obfollow]", async function (e, btn) {
        e.stopPropagation();
        try {
          var r = await App.api.post("/api/users/" + btn.getAttribute("data-obfollow") + "/follow");
          btn.classList.toggle("following", r.following);
          btn.textContent = r.following ? "Following" : "Follow";
        } catch (err) { /* ignore */ }
      });
    }).catch(function () {
      App.$("#obList").innerHTML = '<div class="ob-loading">Could not load accounts.</div>';
    });

    App.$("#obDone").addEventListener("click", function () { App.bootApp(); });
  };

  App.logout = function () {
    App.api.setToken(null);
    App.store.me = null;
    location.reload();
  };
})(window.App);
