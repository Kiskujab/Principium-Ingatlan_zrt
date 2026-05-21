(function () {
  "use strict";

  function getArticleId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") ? String(params.get("id")).trim() : "";
  }

  function trimStartHash(text) {
    var s = String(text).trim();
    if (s.charAt(0) !== "#") return null;
    return s.slice(1).trim();
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;
    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      once: true,
      duration: 700,
      offset: 40,
      disable: reduceMotion
    });
  }

  function refreshAOS() {
    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
      AOS.refresh();
    }
  }

  function renderContent(items, container) {
    container.textContent = "";
    if (!Array.isArray(items)) return;

    items.forEach(function (raw, index) {
      var heading = trimStartHash(raw);
      var delay = String((index % 8) * 50);

      if (heading !== null) {
        var h2 = document.createElement("h2");
        h2.className = "article-h2";
        h2.textContent = heading;
        h2.setAttribute("data-aos", "fade-up");
        h2.setAttribute("data-aos-delay", delay);
        container.appendChild(h2);
      } else {
        var p = document.createElement("p");
        p.className = "article-p";
        p.textContent = String(raw).trim();
        if (p.textContent) {
          p.setAttribute("data-aos", "fade-up");
          p.setAttribute("data-aos-delay", delay);
          container.appendChild(p);
        }
      }
    });
  }

  function setHeaderImage(article) {
    var bg = document.getElementById("article-header-bg");
    if (!bg) return;
    var src =
      (article.headerKep && String(article.headerKep).trim()) ||
      (article.kep && String(article.kep).trim()) ||
      "../images/bg_about.jpg";
    bg.style.backgroundImage = "url('" + src + "')";
  }

  function applyArticle(article) {
    var titleEl = document.getElementById("article-page-title");
    var leadEl = document.getElementById("article-lead");
    var bodyEl = document.getElementById("article-body");
    var errorEl = document.getElementById("article-error");

    if (errorEl) errorEl.hidden = true;

    var pageTitle =
      (article.title && String(article.title).trim()) ||
      (article.cim && String(article.cim).trim()) ||
      "Cikk";

    if (titleEl) titleEl.textContent = pageTitle;
    document.title = pageTitle + " | Principium Ingatlan Zrt.";

    if (leadEl) {
      var lead = article.lead ? String(article.lead).trim() : "";
      leadEl.textContent = lead;
      leadEl.hidden = !lead;
      if (lead) {
        leadEl.setAttribute("data-aos", "fade-up");
      }
    }

    setHeaderImage(article);

    if (bodyEl) {
      renderContent(article.content, bodyEl);
    }

    var meta = document.querySelector('meta[name="description"]');
    var desc = article.lead || article.leiras || "";
    if (meta && desc) {
      meta.setAttribute("content", String(desc).trim());
    }
  }

  function applyCtaEmail(data) {
    var cta = document.getElementById("article-cta");
    var link = document.getElementById("cta-email-link");
    if (!cta || !link) return;

    var email = data && data.email ? String(data.email).trim() : "";
    if (email) {
      link.textContent = email;
      link.setAttribute(
        "href",
        email.indexOf("mailto:") === 0 ? email : "mailto:" + email
      );
      link.removeAttribute("aria-disabled");
    } else {
      link.textContent = "E-mail cím kitöltése";
      link.setAttribute("href", "#");
      link.setAttribute("aria-disabled", "true");
    }
    cta.hidden = false;
  }

  function showError(message) {
    var bodyEl = document.getElementById("article-body");
    var errorEl = document.getElementById("article-error");
    var titleEl = document.getElementById("article-page-title");

    if (titleEl) titleEl.textContent = "A cikk nem található";
    document.title = "Cikk nem található | Principium Ingatlan Zrt.";

    if (bodyEl) bodyEl.textContent = "";
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function findArticle(articles, id) {
    if (!Array.isArray(articles) || !id) return null;
    for (var i = 0; i < articles.length; i++) {
      if (String(articles[i].id).trim() === id) return articles[i];
    }
    return null;
  }

  function initYear() {
    var y = document.getElementById("article-year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function load() {
    initYear();
    initAOS();

    var id = getArticleId();
    if (!id) {
      showError("Nincs megadva cikk azonosító. Használja a cikkek listáját.");
      refreshAOS();
      return;
    }

    Promise.all([
      fetch("articles.json", { cache: "no-store" }).then(function (res) {
        if (!res.ok) throw new Error("articles.json");
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
        var data = results[0];
        var siteData = results[1] || {};
        var article = findArticle(data.articles, id);

        if (!article) {
          showError("A kért cikk („" + id + "”) nem található az articles.json fájlban.");
          refreshAOS();
          return;
        }

        applyArticle(article);
        applyCtaEmail(siteData);
        refreshAOS();
      })
      .catch(function () {
        showError(
          "A cikk betöltése nem sikerült. Nyissa meg az oldalt helyi szerverről (pl. python3 -m http.server)."
        );
        refreshAOS();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
