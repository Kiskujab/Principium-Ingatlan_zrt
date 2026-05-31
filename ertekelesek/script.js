(function () {
  "use strict";

  var P = window.Principium;

  function createReviewCard(review, index) {
    var card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", String((index % 6) * 80));

    if (review.id) {
      card.setAttribute("data-review-id", String(review.id));
    }

    var stars = P.clampStars(review.csillag);
    card.appendChild(P.createStars(stars));

    var quote = document.createElement("blockquote");
    quote.className = "review-quote";
    var p = document.createElement("p");
    p.textContent = review.szoveg ? String(review.szoveg).trim() : "";
    quote.appendChild(p);
    card.appendChild(quote);

    var footer = document.createElement("footer");
    footer.className = "review-meta";

    var name = document.createElement("cite");
    name.className = "review-name";
    name.textContent = review.nev ? String(review.nev).trim() : "";

    var date = document.createElement("time");
    date.className = "review-date";
    date.textContent = review.datum ? String(review.datum).trim() : "";

    footer.appendChild(name);
    if (date.textContent) footer.appendChild(date);
    card.appendChild(footer);

    return card;
  }

  function applyPageMeta(data) {
    var titleEl = document.getElementById("reviews-title");
    var leadEl = document.getElementById("reviews-lead");
    var pageTitle = data.pageTitle ? String(data.pageTitle).trim() : "Értékelések";

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

  function renderReviews(reviews) {
    var grid = document.getElementById("reviews-grid");
    var empty = document.getElementById("reviews-empty");
    var error = document.getElementById("reviews-error");
    if (!grid) return;

    grid.textContent = "";
    if (error) error.hidden = true;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    reviews.forEach(function (review, index) {
      grid.appendChild(createReviewCard(review, index));
    });
  }

  function showError() {
    var grid = document.getElementById("reviews-grid");
    var error = document.getElementById("reviews-error");
    var empty = document.getElementById("reviews-empty");
    if (grid) grid.textContent = "";
    if (empty) empty.hidden = true;
    if (error) error.hidden = false;
  }

  function load() {
    P.setYear("reviews-year");
    P.initNav();
    P.initAOS({ offset: 48 });

    P.fetchJSON("reviews.json")
      .then(function (data) {
        applyPageMeta(data);
        renderReviews(data.reviews);
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
