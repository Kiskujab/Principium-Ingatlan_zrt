(function () {
  "use strict";

  function clampStars(value) {
    var n = Math.round(Number(value));
    if (isNaN(n) || n < 1) return 1;
    if (n > 5) return 5;
    return n;
  }

  function createStars(count) {
    var wrap = document.createElement("div");
    wrap.className = "review-stars";
    wrap.setAttribute("aria-label", count + " csillag az 5-ből");

    for (var i = 0; i < 5; i++) {
      var star = document.createElement("span");
      star.className = "review-star" + (i < count ? " review-star--filled" : "");
      star.setAttribute("aria-hidden", "true");
      star.textContent = "★";
      wrap.appendChild(star);
    }

    return wrap;
  }

  function createReviewCard(review, index) {
    var card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", String((index % 6) * 80));

    if (review.id) {
      card.setAttribute("data-review-id", String(review.id));
    }

    var stars = clampStars(review.csillag);
    card.appendChild(createStars(stars));

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

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.getElementById("mobile-nav");
    if (!toggle || !mobile) return;

    toggle.addEventListener("click", function () {
      var open = mobile.hasAttribute("hidden");
      if (open) {
        mobile.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
      } else {
        mobile.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobile.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function initYear() {
    var y = document.getElementById("reviews-year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;
    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      once: true,
      duration: 700,
      offset: 48,
      disable: reduceMotion
    });
  }

  function refreshAOS() {
    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
      AOS.refresh();
    }
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
    initYear();
    initNav();
    initAOS();

    fetch("reviews.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("reviews.json");
        return res.json();
      })
      .then(function (data) {
        applyPageMeta(data);
        renderReviews(data.reviews);
        refreshAOS();
      })
      .catch(function () {
        showError();
        refreshAOS();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
