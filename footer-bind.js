/* footer-bind.js — lábléc elérhetőség kötése aloldalakon (a shared.js-re épül) */
(function () {
  "use strict";

  var SCRIPT_EL = document.currentScript;

  function load() {
    var P = window.Principium;
    if (!P) return;
    var jsonPath = (SCRIPT_EL && SCRIPT_EL.getAttribute("data-json")) || "data.json";

    P.fetchJSON(jsonPath).then(P.bindFooterContact).catch(function () {});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
