/* shared.js — közös segédfüggvények minden oldalhoz (window.Principium) */
(function (global) {
  "use strict";

  /* ---- Navigáció (hamburger / mobil menü) ---- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var mobile = document.getElementById("mobile-nav");
    if (!toggle || !mobile) return;

    function setOpen(open) {
      if (open) {
        mobile.removeAttribute("hidden");
      } else {
        mobile.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(mobile.hasAttribute("hidden"));
    });

    // Menüpontra kattintva záruljon be
    mobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        setOpen(false);
      });
    });

    // Kattintás/koppintás a menün kívülre → zárás
    document.addEventListener("click", function (e) {
      if (mobile.hasAttribute("hidden")) return;
      if (mobile.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    // Escape billentyű → zárás
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !mobile.hasAttribute("hidden")) setOpen(false);
    });
  }

  /* ---- AOS animációk ---- */
  function initAOS(options) {
    if (typeof AOS === "undefined") return;
    var reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var cfg = { once: true, duration: 700, disable: reduceMotion };
    if (options) {
      for (var k in options) {
        if (Object.prototype.hasOwnProperty.call(options, k)) cfg[k] = options[k];
      }
    }
    AOS.init(cfg);
  }

  function refreshAOS() {
    if (typeof AOS !== "undefined" && typeof AOS.refresh === "function") {
      AOS.refresh();
    }
  }

  /* ---- Év a láblécben ---- */
  function setYear(id) {
    var y = document.getElementById(id);
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---- JSON betöltés (böngésző-cache engedélyezve a teljesítményért) ---- */
  function fetchJSON(url) {
    return fetch(url, { cache: "default" }).then(function (res) {
      if (!res.ok) throw new Error(url);
      return res.json();
    });
  }

  /* ---- Közösségi linkek ---- */
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

  /* ---- Lábléc elérhetőség (telefon + közösségi) ---- */
  function bindFooterContact(data) {
    var phoneEl = document.getElementById("link-phone");
    if (phoneEl) {
      phoneEl.textContent = data.telefon || phoneEl.textContent;
      var tel = String(data.telefon || "").replace(/\s/g, "");
      if (tel && tel.indexOf("_") === -1 && tel.toUpperCase().indexOf("TÖLTSD") === -1) {
        phoneEl.href = "tel:" + tel.replace(/[^\d+]/g, "");
      } else {
        phoneEl.href = "#";
      }
    }
    bindSocialLinks(data);
  }

  /* ---- Csillagos értékelés ---- */
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

  global.Principium = {
    initNav: initNav,
    initAOS: initAOS,
    refreshAOS: refreshAOS,
    setYear: setYear,
    fetchJSON: fetchJSON,
    normalizeSocialUrl: normalizeSocialUrl,
    applySocialLink: applySocialLink,
    bindSocialLinks: bindSocialLinks,
    bindFooterContact: bindFooterContact,
    clampStars: clampStars,
    createStars: createStars
  };
})(window);
