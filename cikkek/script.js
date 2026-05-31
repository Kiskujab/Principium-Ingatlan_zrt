(function () {
  "use strict";

  var P = window.Principium;

  function applyPageMeta(data) {
    var titleEl = document.getElementById("hub-title");
    var leadEl = document.getElementById("hub-lead");
    var pageTitle = data.pageTitle ? String(data.pageTitle).trim() : "Hasznos tippek";

    if (titleEl) titleEl.textContent = pageTitle;
    document.title = pageTitle + " | Principium Ingatlan Zrt.";

    if (leadEl) {
      leadEl.textContent = data.pageLead ? String(data.pageLead).trim() : "";
      leadEl.hidden = !leadEl.textContent;
    }

    var meta = document.querySelector('meta[name="description"]');
    if (meta && data.pageLead) {
      meta.setAttribute("content", String(data.pageLead).trim());
    }
  }

  function createArticleCard(article, index) {
    var card = document.createElement("article");
    card.className = "article-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", String((index % 6) * 80));

    var link = document.createElement("a");
    link.className = "article-card-link";
    var articleId = article.id ? String(article.id).trim() : "";
    link.href = articleId ? "cikk.html?id=" + encodeURIComponent(articleId) : "#";
    if (articleId) link.setAttribute("data-article-id", articleId);

    var media = document.createElement("div");
    media.className = "article-card-media";
    var img = document.createElement("img");
    img.className = "article-card-img";
    img.src = article.kep ? String(article.kep).trim() : "";
    img.alt = article.cim ? String(article.cim).trim() : "";
    img.loading = "lazy";
    img.decoding = "async";
    if (!img.src) img.removeAttribute("src");
    media.appendChild(img);

    var body = document.createElement("div");
    body.className = "article-card-body";

    var h2 = document.createElement("h2");
    h2.className = "article-card-title";
    h2.textContent = article.cim ? String(article.cim).trim() : "";

    var p = document.createElement("p");
    p.className = "article-card-desc";
    p.textContent = article.leiras ? String(article.leiras).trim() : "";

    var cta = document.createElement("span");
    cta.className = "article-card-cta";
    cta.textContent = "Tovább olvasom";

    body.appendChild(h2);
    body.appendChild(p);
    body.appendChild(cta);
    link.appendChild(media);
    link.appendChild(body);
    card.appendChild(link);

    return card;
  }

  function renderArticles(articles) {
    var grid = document.getElementById("articles-grid");
    var empty = document.getElementById("articles-empty");
    var error = document.getElementById("articles-error");
    if (!grid) return;

    grid.textContent = "";
    if (error) error.hidden = true;

    if (!Array.isArray(articles) || articles.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    articles.forEach(function (article, index) {
      grid.appendChild(createArticleCard(article, index));
    });
  }

  function showError() {
    var grid = document.getElementById("articles-grid");
    var error = document.getElementById("articles-error");
    var empty = document.getElementById("articles-empty");
    if (grid) grid.textContent = "";
    if (empty) empty.hidden = true;
    if (error) error.hidden = false;
  }

  function load() {
    P.setYear("hub-year");
    P.initNav();
    P.initAOS({ offset: 48 });

    P.fetchJSON("articles.json")
      .then(function (data) {
        applyPageMeta(data);
        renderArticles(data.articles);
        P.refreshAOS();
      })
      .catch(function () {
        showError();
        P.refreshAOS();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
