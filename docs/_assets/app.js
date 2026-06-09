(function () {
  "use strict";

  var root = document.documentElement;
  var panes = Array.prototype.slice.call(document.querySelectorAll(".pane"));
  var navItems = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  var tocList = document.getElementById("toc-list");
  var content = document.getElementById("main");

  /* ---------- theme ---------- */
  var THEME_KEY = "kd-theme";
  function storedTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function effectiveDark() {
    var t = root.getAttribute("data-theme");
    if (t === "dark") return true;
    if (t === "light") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function applyThemeIcon() {
    var i = document.querySelector("#theme-toggle .ti");
    if (i) i.className = "ti " + (effectiveDark() ? "ti-sun" : "ti-moon");
  }
  (function initTheme() {
    var s = storedTheme();
    if (s) root.setAttribute("data-theme", s);
    applyThemeIcon();
  })();
  var themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = effectiveDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyThemeIcon();
      resetDiagrams();
      renderDiagramsIn(currentPane());
    });
  }

  /* ---------- mermaid ---------- */
  var hasMermaid = typeof window.mermaid !== "undefined";
  if (hasMermaid) {
    document.querySelectorAll(".mermaid").forEach(function (el) {
      el.setAttribute("data-src", el.textContent);
    });
    initMermaid();
  }
  function initMermaid() {
    try {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: effectiveDark() ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "inherit"
      });
    } catch (e) {}
  }
  function renderDiagramsIn(pane) {
    if (!hasMermaid || !pane) return;
    var nodes = Array.prototype.slice.call(pane.querySelectorAll(".mermaid"))
      .filter(function (el) { return !el.getAttribute("data-done"); });
    if (!nodes.length) return;
    try {
      window.mermaid.run({ nodes: nodes });
      nodes.forEach(function (el) { el.setAttribute("data-done", "1"); });
    } catch (e) {}
  }
  function resetDiagrams() {
    if (!hasMermaid) return;
    initMermaid();
    document.querySelectorAll(".mermaid").forEach(function (el) {
      var src = el.getAttribute("data-src");
      if (src == null) return;
      el.removeAttribute("data-processed");
      el.removeAttribute("data-done");
      el.innerHTML = "";
      el.textContent = src;
    });
  }

  /* ---------- navigation ---------- */
  function currentPane() {
    for (var i = 0; i < panes.length; i++) if (!panes[i].hidden) return panes[i];
    return panes[0];
  }
  function showSection(id, anchor) {
    var found = false;
    panes.forEach(function (p) {
      var match = p.id === "pane-" + id;
      p.hidden = !match;
      if (match) found = true;
    });
    if (!found && panes.length) {
      id = panes[0].id.replace(/^pane-/, "");
      panes[0].hidden = false;
    }
    navItems.forEach(function (n) {
      n.classList.toggle("active", n.getAttribute("data-target") === id);
    });
    buildToc();
    renderDiagramsIn(currentPane());
    if (anchor) {
      var el = document.getElementById(anchor);
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }
  navItems.forEach(function (n) {
    n.addEventListener("click", function () {
      var id = n.getAttribute("data-target");
      history.replaceState(null, "", "#" + id);
      showSection(id);
    });
  });

  /* ---------- table of contents ---------- */
  function buildToc() {
    tocList.innerHTML = "";
    var pane = currentPane();
    if (!pane) return;
    var heads = pane.querySelectorAll("h2[id], h3[id]");
    heads.forEach(function (h) {
      var li = document.createElement("li");
      if (h.tagName === "H3") li.className = "lvl3";
      var a = document.createElement("a");
      a.href = "#" + currentId() + "/" + h.id;
      a.textContent = h.textContent;
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        history.replaceState(null, "", a.getAttribute("href"));
        h.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      li.appendChild(a);
      tocList.appendChild(li);
    });
    setupSpy(heads);
  }
  function currentId() {
    return currentPane().id.replace(/^pane-/, "");
  }
  var spyObserver = null;
  function setupSpy(heads) {
    if (spyObserver) spyObserver.disconnect();
    if (!("IntersectionObserver" in window) || !heads.length) return;
    spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var links = tocList.querySelectorAll("a");
        links.forEach(function (l) {
          l.classList.toggle("active", l.getAttribute("href").split("/").pop() === en.target.id);
        });
      });
    }, { rootMargin: "-60px 0px -70% 0px" });
    heads.forEach(function (h) { spyObserver.observe(h); });
  }

  /* ---------- search ---------- */
  var searchInput = document.getElementById("search");
  var searchResults = document.getElementById("search-results");
  var searchIndex = panes.map(function (p) {
    var id = p.id.replace(/^pane-/, "");
    var title = (p.querySelector(".sh-title h1") || {}).textContent || id;
    var entries = [];
    p.querySelectorAll("h2[id], h3[id]").forEach(function (h) {
      entries.push({ text: h.textContent, anchor: h.id });
    });
    var text = (p.textContent || "").toLowerCase();
    return { id: id, title: title, entries: entries, text: text };
  });
  function runSearch(q) {
    q = q.trim().toLowerCase();
    searchResults.innerHTML = "";
    if (q.length < 2) { searchResults.classList.remove("open"); return; }
    var hits = [];
    searchIndex.forEach(function (s) {
      if (s.title.toLowerCase().indexOf(q) !== -1) {
        hits.push({ id: s.id, sec: s.title, text: s.title, anchor: "" });
      }
      s.entries.forEach(function (e) {
        if (e.text.toLowerCase().indexOf(q) !== -1) {
          hits.push({ id: s.id, sec: s.title, text: e.text, anchor: e.anchor });
        }
      });
      if (hits.length < 30 && s.text.indexOf(q) !== -1
          && s.title.toLowerCase().indexOf(q) === -1) {
        var idx = s.text.indexOf(q);
        var snippet = s.text.substr(Math.max(0, idx - 30), 70).trim();
        hits.push({ id: s.id, sec: s.title, text: "…" + snippet + "…", anchor: "" });
      }
    });
    hits = hits.slice(0, 24);
    if (!hits.length) {
      searchResults.innerHTML = '<div class="sr-empty">No matches</div>';
      searchResults.classList.add("open");
      return;
    }
    hits.forEach(function (h) {
      var d = document.createElement("div");
      d.className = "sr-item";
      d.innerHTML = '<div class="sr-sec">' + escapeHtml(h.sec) + '</div>'
        + '<div class="sr-text">' + escapeHtml(h.text) + '</div>';
      d.addEventListener("mousedown", function (ev) {
        ev.preventDefault();
        history.replaceState(null, "", "#" + h.id + (h.anchor ? "/" + h.anchor : ""));
        showSection(h.id, h.anchor);
        searchResults.classList.remove("open");
        searchInput.value = "";
      });
      searchResults.appendChild(d);
    });
    searchResults.classList.add("open");
  }
  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (searchInput) {
    searchInput.addEventListener("input", function () { runSearch(this.value); });
    searchInput.addEventListener("focus", function () {
      if (this.value.trim().length >= 2) runSearch(this.value);
    });
    document.addEventListener("click", function (ev) {
      if (!searchResults.contains(ev.target) && ev.target !== searchInput) {
        searchResults.classList.remove("open");
      }
    });
  }

  /* ---------- copy buttons ---------- */
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest(".copy-btn");
    if (!btn) return;
    var block = btn.closest(".codeblock");
    var code = block && block.querySelector("code");
    if (!code) return;
    var text = code.textContent;
    var done = function () {
      btn.classList.add("done");
      btn.querySelector(".ti").className = "ti ti-check";
      setTimeout(function () {
        btn.classList.remove("done");
        btn.querySelector(".ti").className = "ti ti-copy";
      }, 1400);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done();
    }
  });

  /* ---------- diagram zoom ---------- */
  var overlay = document.getElementById("zoom-overlay");
  var zoomInner = document.getElementById("zoom-inner");
  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest && ev.target.closest(".zoom-btn");
    if (btn) {
      var svg = btn.parentNode.querySelector("svg");
      if (svg && overlay) {
        zoomInner.innerHTML = "";
        zoomInner.appendChild(svg.cloneNode(true));
        overlay.hidden = false;
      }
      return;
    }
    if (overlay && !overlay.hidden && (ev.target === overlay || ev.target === zoomInner)) {
      overlay.hidden = true;
    }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && overlay && !overlay.hidden) overlay.hidden = true;
  });

  /* ---------- stale filter ---------- */
  var onlyStale = document.getElementById("only-stale");
  if (onlyStale) {
    onlyStale.addEventListener("change", function () {
      var on = this.checked;
      navItems.forEach(function (n) {
        var review = n.getAttribute("data-status") === "review";
        n.style.display = (on && !review) ? "none" : "";
      });
      if (on && currentPane().getAttribute("data-status") !== "review") {
        var first = navItems.filter(function (n) {
          return n.getAttribute("data-status") === "review";
        })[0];
        if (first) showSection(first.getAttribute("data-target"));
      }
    });
  }

  /* ---------- initial route ---------- */
  function route() {
    var hash = (location.hash || "").replace(/^#/, "");
    var parts = hash.split("/");
    if (parts[0]) showSection(parts[0], parts[1]);
    else if (navItems.length) showSection(navItems[0].getAttribute("data-target"));
  }
  route();
})();
