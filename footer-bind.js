(function () {
  "use strict";

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

    document.querySelectorAll("#footer-meta [data-meta]").forEach(function (el) {
      var key = el.getAttribute("data-meta");
      var val = data[key];
      if (!val || !String(val).trim() || String(val).trim().toUpperCase().indexOf("TÖLTSD") !== -1) {
        el.textContent = "";
        el.style.display = "none";
      } else {
        el.style.display = "";
        var label = key === "adoszam" ? "Adószám: " : "Cégjegyzékszám: ";
        el.textContent = label + String(val).trim();
      }
    });
  }

  function load() {
    var script = document.currentScript;
    var jsonPath = (script && script.getAttribute("data-json")) || "data.json";

    fetch(jsonPath, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("data.json");
        return res.json();
      })
      .then(bindFooterContact)
      .catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
