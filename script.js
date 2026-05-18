(function () {
  "use strict";

  function bindText(data) {
    document.querySelectorAll("[data-bind]").forEach(function (el) {
      var key = el.getAttribute("data-bind");
      if (!key || !(key in data)) return;
      var value = data[key];
      if (value === null || value === undefined) value = "";
      if (el.tagName === "A" && (key === "telefon" || key === "email")) return;
      el.textContent = String(value).trim() || el.textContent;
    });
  }

  function setHref(el, prefix, value) {
    if (!el) return;
    var v = String(value || "").trim();
    if (!v) return;
    if (v.indexOf("mailto:") === 0 || v.indexOf("tel:") === 0 || v.indexOf("http") === 0) {
      el.setAttribute("href", v);
      return;
    }
    if (prefix === "mailto:") {
      el.setAttribute("href", "mailto:" + v);
      return;
    }
    el.setAttribute("href", prefix + v.replace(/\s/g, ""));
  }

  function bindLinks(data) {
    var phoneEl = document.getElementById("link-phone");
    var emailEl = document.getElementById("link-email");
    if (phoneEl) {
      phoneEl.textContent = data.telefon || phoneEl.textContent;
      var tel = String(data.telefon || "").replace(/\s/g, "");
      if (tel && tel.indexOf("_") === -1) {
        phoneEl.setAttribute("href", "tel:" + tel.replace(/[^\d+]/g, ""));
      } else {
        phoneEl.setAttribute("href", "#contact");
      }
    }
    if (emailEl) {
      emailEl.textContent = data.email || emailEl.textContent;
      setHref(emailEl, "mailto:", data.email);
    }

    var fb = document.getElementById("social-fb");
    var li = document.getElementById("social-li");
    var fbUrl = String(data.social_facebook || "").trim();
    var liUrl = String(data.social_linkedin || "").trim();
    if (fb) {
      if (fbUrl) {
        fb.removeAttribute("hidden");
        fb.setAttribute("href", fbUrl);
      } else {
        fb.setAttribute("hidden", "");
      }
    }
    if (li) {
      if (liUrl) {
        li.removeAttribute("hidden");
        li.setAttribute("href", liUrl);
      } else {
        li.setAttribute("hidden", "");
      }
    }
  }

  function bindLeaderImage(data) {
    var img = document.getElementById("leader-img");
    if (!img) return;
    var name = String(data.vezeto_neve || "").trim();
    img.setAttribute("alt", name ? name + " portré" : "Ügyvezető portré");
  }

  function bindFooterMeta(data) {
    document.querySelectorAll("#footer-meta [data-meta]").forEach(function (el) {
      var key = el.getAttribute("data-meta");
      var val = data[key];
      if (!val || !String(val).trim()) {
        el.textContent = "";
        el.style.display = "none";
      } else {
        el.style.display = "";
        var label = key === "adoszam" ? "Adószám: " : "Cégjegyzékszám: ";
        el.textContent = label + String(val).trim();
      }
    });
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
    bindFooterMeta(data);
  }

  function load() {
    initYear();
    initNav();
    initAOS();

    fetch("data.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("data.json betöltése sikertelen");
        return res.json();
      })
      .then(function (data) {
        applyData(data);
        refreshAOS();
      })
      .catch(function () {
        console.warn("Principium: data.json nem elérhető (használjon helyi szervert, pl. npx serve vagy Live Server).");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
