(function () {
  "use strict";

  function bindText(data) {
    document.querySelectorAll("[data-bind]").forEach(function (el) {
      var key = el.getAttribute("data-bind");
      if (!key || !(key in data)) return;
      if (key === "social_facebook" || key === "social_linkedin") return;
      var value = data[key];
      if (value === null || value === undefined) value = "";
      if (el.tagName === "A" && (key === "telefon" || key === "email")) return;
      el.textContent = String(value).trim() || el.textContent;
    });
  }

  function normalizeSocialUrl(url) {
    var v = String(url || "").trim();
    if (!v || v.toUpperCase().indexOf("TÖLTSD") !== -1) return "";
    if (v.indexOf("http://") === 0 || v.indexOf("https://") === 0) return v;
    if (v.indexOf("www.") === 0) return "https://" + v;
    return "";
  }

  function applySocialLink(element, url) {
    if (!element) return;
    var normalized = normalizeSocialUrl(url);
    if (normalized) {
      element.href = normalized;
      element.removeAttribute("hidden");
    } else {
      element.setAttribute("hidden", "");
    }
  }

  function bindSocialLinks(data) {
    applySocialLink(document.getElementById("social-fb"), data.social_facebook);
    applySocialLink(document.getElementById("social-li"), data.social_linkedin);
  }

  function bindLinks(data) {
    var phoneEl = document.getElementById("link-phone");
    if (phoneEl) {
      phoneEl.textContent = data.telefon || phoneEl.textContent;
      var tel = String(data.telefon || "").replace(/\s/g, "");
      if (tel && tel.indexOf("_") === -1) {
        phoneEl.setAttribute("href", "tel:" + tel.replace(/[^\d+]/g, ""));
      } else {
        phoneEl.setAttribute("href", "#contact");
      }
    }

    bindSocialLinks(data);
  }

  function bindLeaderImage(data) {
    var img = document.getElementById("leader-img");
    if (!img) return;
    var name = String(data.vezeto_neve || "").trim();
    img.setAttribute("alt", name ? name + " portré" : "Ügyvezető portré");
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
    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initAOS() {
    if (typeof AOS === "undefined") return;
    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    AOS.init({
      once: true,
      duration: 800,
      disable: reduceMotion
    });
  }

  function refreshAOS() {
    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
      AOS.refresh();
    }
  }

  function applyData(data) {
    bindText(data);
    bindLinks(data);
    bindLeaderImage(data);
  }

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

  function createPreviewCard(review, index) {
    var card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", String(index * 100));

    card.appendChild(createStars(clampStars(review.csillag)));

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

  function renderTestimonialsPreview(reviews) {
    var container = document.getElementById("testimonials-preview");
    if (!container || !Array.isArray(reviews)) return;

    container.textContent = "";
    var preview = reviews.slice(0, 2);

    preview.forEach(function (review, index) {
      container.appendChild(createPreviewCard(review, index));
    });
  }

  function loadReviews() {
    return fetch("ertekelesek/reviews.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("reviews.json");
        return res.json();
      })
      .then(function (data) {
        renderTestimonialsPreview(data.reviews);
        refreshAOS();
      })
      .catch(function () {
        console.warn("Principium: ertekelesek/reviews.json nem elérhető.");
      });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form || typeof emailjs === "undefined") return;

    emailjs.init("7Is8dAkttewLAIWzc");

    var submitBtn = document.getElementById("cf-submit");
    var submitText = form.querySelector(".form-submit-text");
    var submitSpinner = form.querySelector(".form-submit-spinner");
    var statusEl = document.getElementById("cf-status");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      submitBtn.disabled = true;
      submitText.textContent = "Küldés...";
      submitSpinner.hidden = false;
      statusEl.hidden = true;
      statusEl.className = "form-status";

      emailjs.sendForm("service_h5de4ur", "template_2wvk89l", form)
        .then(function () {
          statusEl.textContent = "Üzenetét sikeresen elküldtük! Hamarosan felvesszük Önnel a kapcsolatot.";
          statusEl.hidden = false;
          form.reset();
        })
        .catch(function () {
          statusEl.textContent = "Sajnos az üzenet küldése nem sikerült. Kérjük, próbálja újra, vagy hívjon minket telefonon.";
          statusEl.className = "form-status form-status--error";
          statusEl.hidden = false;
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitText.textContent = "Üzenet küldése";
          submitSpinner.hidden = true;
        });
    });
  }

  function load() {
    initYear();
    initNav();
    initAOS();
    initContactForm();

    var dataPromise = fetch("data.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("data.json betöltése sikertelen");
        return res.json();
      })
      .then(function (data) {
        applyData(data);
      })
      .catch(function () {
        console.warn("Principium: data.json nem elérhető (használjon helyi szervert, pl. npx serve vagy Live Server).");
      });

    Promise.all([dataPromise, loadReviews()]).then(function () {
      refreshAOS();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
