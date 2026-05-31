(function () {
  "use strict";

  var P = window.Principium;

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

  function bindLeaderImage(data) {
    var img = document.getElementById("leader-img");
    if (!img) return;
    var name = String(data.vezeto_neve || "").trim();
    img.setAttribute("alt", name ? name + " portré" : "Ügyvezető portré");
  }

  function applyData(data) {
    bindText(data);
    P.bindFooterContact(data);
    bindLeaderImage(data);
  }

  function createPreviewCard(review, index) {
    var card = document.createElement("article");
    card.className = "review-card";
    card.setAttribute("role", "listitem");
    card.setAttribute("data-aos", "fade-up");
    card.setAttribute("data-aos-delay", String(index * 100));

    card.appendChild(P.createStars(P.clampStars(review.csillag)));

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
    return P.fetchJSON("ertekelesek/reviews.json")
      .then(function (data) {
        renderTestimonialsPreview(data.reviews);
        P.refreshAOS();
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

      // Honeypot: ha a rejtett mező ki van töltve, valószínűleg bot — csendben eldobjuk
      var honeypot = form.elements["company_website"];
      if (honeypot && honeypot.value.trim() !== "") {
        return;
      }

      // Throttle: amíg egy küldés folyamatban van, ne induljon újabb (dupla kattintás ellen)
      if (form.dataset.sending === "1") return;
      form.dataset.sending = "1";

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
          form.dataset.sending = "0";
          submitBtn.disabled = false;
          submitText.textContent = "Üzenet küldése";
          submitSpinner.hidden = true;
        });
    });
  }

  function load() {
    P.setYear("year");
    P.initNav();
    P.initAOS({ duration: 800 });
    initContactForm();

    var dataPromise = P.fetchJSON("data.json")
      .then(applyData)
      .catch(function () {
        console.warn("Principium: data.json nem elérhető (használjon helyi szervert, pl. npx serve vagy Live Server).");
      });

    Promise.all([dataPromise, loadReviews()]).then(function () {
      P.refreshAOS();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
