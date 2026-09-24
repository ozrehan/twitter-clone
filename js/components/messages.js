/* components/messages.js — conversation list + working chat thread. */
(function (App) {
  "use strict";

  App.renderMessages = function (root) {
    var active = App.CONVOS.find(function (c) { return c.id === App.store.activeConvo; }) || App.CONVOS[0];

    root.innerHTML =
      '<div class="view-head"><div class="titles"><b>Messages</b></div></div>' +
      '<div class="msg-layout">' +
        '<div class="convo-list" id="convoList"></div>' +
        '<div class="thread" id="thread"></div>' +
      "</div>";

    var listEl = App.$("#convoList", root);
    listEl.innerHTML = App.CONVOS.map(function (c) {
      var u = App.userById(c.userId);
      var last = c.messages[c.messages.length - 1];
      return '<div class="convo' + (c.id === active.id ? " active" : "") + '" data-convo="' + c.id + '">' +
        '<img src="' + App.avatar(u.seed) + '" alt="">' +
        '<div class="c-body"><div class="c-top"><b>' + App.esc(u.name) + "</b><time>" + App.esc(last.time) + "</time></div>" +
        '<div class="c-snip">' + App.esc(last.text) + "</div></div></div>";
    }).join("");

    drawThread(App.$("#thread", root), active);

    App.on(root, "click", "[data-convo]", function (e, el) {
      App.store.activeConvo = el.getAttribute("data-convo");
      var c = App.CONVOS.find(function (x) { return x.id === App.store.activeConvo; });
      c.unread = 0;
      App.render(); /* refreshes sidebar badge too */
    });
  };

  function drawThread(slot, convo) {
    var u = App.userById(convo.userId);
    slot.innerHTML =
      '<div class="thread-head"><img src="' + App.avatar(u.seed) + '" alt="">' +
        "<div><b>" + App.esc(u.name) + '</b><div class="online" id="threadStatus">' + App.esc(convo.online) + "</div></div></div>" +
      '<div class="thread-body" id="threadBody">' +
        convo.messages.map(function (m) {
          return '<div class="msg ' + m.dir + '">' + App.esc(m.text) +
            '<span class="m-time">' + App.esc(m.time) + "</span></div>";
        }).join("") +
      "</div>" +
      '<div class="thread-input">' +
        '<input id="threadInput" placeholder="Start a new message">' +
        '<button id="threadSend" disabled>' + App.icon("send") + "</button>" +
      "</div>";

    var body = App.$("#threadBody", slot);
    body.scrollTop = body.scrollHeight;
    var input = App.$("#threadInput", slot);
    var sendBtn = App.$("#threadSend", slot);

    input.addEventListener("input", function () { sendBtn.disabled = !input.value.trim(); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") sendBtn.click(); });

    var replyTimer = null;
    sendBtn.addEventListener("click", function () {
      var text = input.value.trim();
      if (!text) return;
      convo.messages.push({ dir: "out", text: text, time: "now" });
      input.value = ""; sendBtn.disabled = true;
      drawThread(slot, convo); /* re-render with new message */

      /* fake typing indicator + auto-reply */
      var status = App.$("#threadStatus", slot);
      clearTimeout(replyTimer);
      replyTimer = setTimeout(function () {
        if (status) status.textContent = "typing…";
        setTimeout(function () {
          var r = App.BOT_REPLIES[Math.floor(Math.random() * App.BOT_REPLIES.length)];
          convo.messages.push({ dir: "in", text: r, time: "now" });
          drawThread(slot, convo);
        }, 1500);
      }, 800);
    });
  }
})(window.App);
