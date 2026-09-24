/* components/messages.js — conversation list + chat thread (API-backed, persistent). */
(function (App) {
  "use strict";

  App.renderMessages = function (root) {
    root.innerHTML =
      '<div class="view-head"><div class="titles"><b>Messages</b></div></div>' +
      '<div class="msg-layout">' +
        '<div class="convo-list" id="convoList"><div class="ob-loading">Loading…</div></div>' +
        '<div class="thread" id="thread"></div>' +
      "</div>";

    App.loadConvos().then(function () {
      drawList(App.$("#convoList", root));
      var active = App.CONVOS.find(function (c) { return c.username === App.store.activeConvo; }) || App.CONVOS[0];
      if (active) {
        App.store.activeConvo = active.username;
        drawList(App.$("#convoList", root));
        drawThread(App.$("#thread", root), active);
      } else {
        App.$("#thread", root).innerHTML =
          '<div class="empty-state"><h3>No conversations yet</h3><p>Start one from someone\'s profile.</p></div>';
      }
    }).catch(function () {
      App.$("#convoList", root).innerHTML = '<div class="empty-state"><h3>Could not load messages</h3></div>';
    });

    App.on(root, "click", "[data-convo]", function (e, el) {
      App.store.activeConvo = el.getAttribute("data-convo");
      var c = App.CONVOS.find(function (x) { return x.username === App.store.activeConvo; });
      if (c) { c.unread = 0; drawList(App.$("#convoList", root)); drawThread(App.$("#thread", root), c); }
      App.renderSidebar(App.$("#sidebar")); /* refresh badge */
    });
  };

  function drawList(slot) {
    if (!slot) return;
    slot.innerHTML = App.CONVOS.map(function (c) {
      return '<div class="convo' + (c.username === App.store.activeConvo ? " active" : "") + '" data-convo="' + c.username + '">' +
        '<img src="' + App.avatar(c.seed) + '" alt="">' +
        '<div class="c-body"><div class="c-top"><b>' + App.esc(c.name) + "</b><time>" + App.esc(c.time) + "</time></div>" +
        '<div class="c-snip">' + (c.unread ? "<b>" : "") + App.esc(c.lastText) + (c.unread ? "</b>" : "") + "</div></div>" +
        (c.unread ? '<span class="badge">' + c.unread + "</span>" : "") + "</div>";
    }).join("");
  }

  function drawThread(slot, convo) {
    var me = App.store.currentUserId;
    slot.innerHTML =
      '<div class="thread-head"><img src="' + App.avatar(convo.seed) + '" alt="">' +
        "<div><b>" + App.esc(convo.name) + '</b><div class="online" id="threadStatus">@' + App.esc(convo.username) + "</div></div></div>" +
      '<div class="thread-body" id="threadBody"><div class="ob-loading">Loading…</div></div>' +
      '<div class="thread-input">' +
        '<input id="threadInput" placeholder="Start a new message">' +
        '<button id="threadSend" disabled>' + App.icon("send") + "</button>" +
      "</div>";

    var body = App.$("#threadBody", slot);
    var input = App.$("#threadInput", slot);
    var sendBtn = App.$("#threadSend", slot);

    App.api.get("/api/dm/" + convo.username).then(function (res) {
      renderMsgs(res.messages);
      convo.unread = 0;
      App.renderSidebar(App.$("#sidebar"));
    }).catch(function () {
      body.innerHTML = '<div class="empty-state"><h3>Could not load conversation</h3></div>';
    });

    function renderMsgs(msgs) {
      body.innerHTML = msgs.map(function (m) {
        return '<div class="msg ' + (m.from === me ? "out" : "in") + '">' + App.esc(m.text) +
          '<span class="m-time">' + App.esc(m.time) + "</span></div>";
      }).join("");
      body.scrollTop = body.scrollHeight;
    }

    input.addEventListener("input", function () { sendBtn.disabled = !input.value.trim(); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") sendBtn.click(); });

    sendBtn.addEventListener("click", async function () {
      var text = input.value.trim();
      if (!text) return;
      input.value = ""; sendBtn.disabled = true;
      var status = App.$("#threadStatus", slot);
      try {
        /* optimistic bubble */
        body.insertAdjacentHTML("beforeend",
          '<div class="msg out">' + App.esc(text) + '<span class="m-time">now</span></div>');
        body.scrollTop = body.scrollHeight;
        if (status) status.textContent = "typing…";
        var res = await App.api.post("/api/dm/" + convo.username, { text: text });
        if (status) status.textContent = "@" + convo.username;
        /* refetch to get canonical ordering incl. bot reply */
        var thread = await App.api.get("/api/dm/" + convo.username);
        renderMsgs(thread.messages);
      } catch (e) {
        if (status) status.textContent = "@" + convo.username;
      }
    });
  }
})(window.App);
