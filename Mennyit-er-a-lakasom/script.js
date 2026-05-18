(function () {
  "use strict";

  function trimStartHash(text) {
    var s = String(text).trim();
    if (s.charAt(0) !== "#") return null;
    return s.slice(1).trim();
  }

  function renderContent(items, container) {
    container.textContent = "";
    if (!Array.isArray(items)) return;

    items.forEach(function (raw) {
      var heading = trimStartHash(raw);
      if (heading !== null) {
        var h2 = document.createElement("h2");
        h2.className = "article-h2";
        h2.textContent = heading;
        container.appendChild(h2);
      } else {
        var p = document.createElement("p");
        p.className = "article-p";
        p.textContent = String(raw).trim();
        if (p.textContent) container.appendChild(p);
      }
    });
  }

  function applyArticle(article) {
    var titleEl = document.getElementById("article-page-title");
    var leadEl = document.getElementById("article-lead");
    var bodyEl = document.getElementById("article-body");

    if (titleEl && article.title) {
      titleEl.textContent = String(article.title).trim();
      document.title = titleEl.textContent + " | Principium Ingatlan Zrt.";
    }

    if (leadEl && article.lead) {
      leadEl.textContent = String(article.lead).trim();
      leadEl.hidden = !leadEl.textContent;
    }

    if (bodyEl) {
      renderContent(article.content, bodyEl);
    }

    var meta = document.querySelector('meta[name="description"]');
    if (meta && article.lead) {
      meta.setAttribute("content", String(article.lead).trim());
    }
  }

  function applyCtaEmail(data) {
    var cta = document.getElementById("article-cta");
    var link = document.getElementById("cta-email-link");
    if (!cta || !link) return;

    var email = data && data.email ? String(data.email).trim() : "";
    if (email) {
      link.textContent = email;
      if (email.indexOf("mailto:") === 0) {
        link.setAttribute("href", email);
      } else {
        link.setAttribute("href", "mailto:" + email);
      }
    } else {
      link.textContent = "E-mail cím kitöltése";
      link.setAttribute("href", "#");
      link.setAttribute("aria-disabled", "true");
    }
    cta.hidden = false;
  }

  function initYear() {
    var y = document.getElementById("article-year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function load() {
    initYear();

    Promise.all([
      fetch("article.json", { cache: "no-store" }).then(function (res) {
        if (!res.ok) throw new Error("article.json");
        return res.json();
      }),
      fetch("../data.json", { cache: "no-store" })
        .then(function (res) {
          if (!res.ok) return {};
          return res.json();
        })
        .catch(function () {
          return {};
        })
    ])
      .then(function (results) {
        var article = results[0];
        var siteData = results[1] || {};
        applyArticle(article);
        applyCtaEmail(siteData);
      })
      .catch(function () {
        var bodyEl = document.getElementById("article-body");
        if (bodyEl) {
          bodyEl.innerHTML =
            '<p class="article-p article-error">A cikk betöltése nem sikerült. Nyissa meg az oldalt helyi szerverről (pl. Live Server), és ellenőrizze, hogy az <code>article.json</code> a mappában van.</p>';
        }
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
