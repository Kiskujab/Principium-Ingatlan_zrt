(function () {
  "use strict";

  var P = window.Principium;
  var uidCounter = 0;

  function nextId(prefix) {
    uidCounter += 1;
    return prefix + "-" + uidCounter;
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9À-ɏ]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "item";
  }

  function applyPageMeta(data) {
    var titleEl = document.getElementById("faq-title");
    var leadEl = document.getElementById("faq-lead");
    var pageTitle = data.pageTitle ? String(data.pageTitle).trim() : "GYIK";

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

  function groupByCategory(items) {
    var map = new Map();
    var order = [];

    items.forEach(function (item) {
      var cat = item.category ? String(item.category).trim() : "Általános";
      if (!map.has(cat)) {
        map.set(cat, []);
        order.push(cat);
      }
      map.get(cat).push(item);
    });

    return order.map(function (name) {
      return { category: name, items: map.get(name) };
    });
  }

  function setPanelOpen(item, panel, button, open) {
    item.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    panel.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function createFaqItem(item, categorySlug, itemIndex, aosDelay) {
    var qId = nextId("faq-q-" + categorySlug);
    var aId = nextId("faq-a-" + categorySlug);

    var wrap = document.createElement("div");
    wrap.className = "faq-item";
    wrap.setAttribute("data-aos", "fade-up");
    wrap.setAttribute("data-aos-delay", String(aosDelay));

    var button = document.createElement("button");
    button.type = "button";
    button.className = "faq-question";
    button.id = qId;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", aId);

    var qText = document.createElement("span");
    qText.className = "faq-question-text";
    qText.textContent = item.question ? String(item.question).trim() : "";

    var icon = document.createElement("span");
    icon.className = "faq-icon";
    icon.setAttribute("aria-hidden", "true");

    button.appendChild(qText);
    button.appendChild(icon);

    var panel = document.createElement("div");
    panel.className = "faq-answer";
    panel.id = aId;
    panel.setAttribute("role", "region");
    panel.setAttribute("aria-labelledby", qId);
    panel.setAttribute("aria-hidden", "true");

    var inner = document.createElement("div");
    inner.className = "faq-answer-inner";

    var answer = document.createElement("p");
    answer.className = "faq-answer-text";
    answer.textContent = item.answer ? String(item.answer).trim() : "";

    inner.appendChild(answer);
    panel.appendChild(inner);

    button.addEventListener("click", function () {
      var willOpen = !wrap.classList.contains("is-open");
      setPanelOpen(wrap, panel, button, willOpen);
    });

    wrap.appendChild(button);
    wrap.appendChild(panel);
    return wrap;
  }

  function renderFaq(items) {
    var root = document.getElementById("faq-root");
    var empty = document.getElementById("faq-empty");
    var error = document.getElementById("faq-error");
    if (!root) return;

    root.textContent = "";
    if (error) error.hidden = true;

    if (!Array.isArray(items) || items.length === 0) {
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;

    var groups = groupByCategory(items);
    var delay = 0;

    groups.forEach(function (group, groupIndex) {
      var section = document.createElement("section");
      section.className = "faq-category";
      section.setAttribute("data-aos", "fade-up");
      section.setAttribute("data-aos-delay", String((groupIndex % 4) * 60));

      var heading = document.createElement("h2");
      heading.className = "faq-category-title";
      heading.textContent = group.category;

      var accordion = document.createElement("div");
      accordion.className = "faq-accordion";

      var catSlug = slugify(group.category);

      group.items.forEach(function (item, itemIndex) {
        delay += 40;
        accordion.appendChild(createFaqItem(item, catSlug, itemIndex, delay % 320));
      });

      section.appendChild(heading);
      section.appendChild(accordion);
      root.appendChild(section);
    });

    injectFaqSchema(items);
  }

  function injectFaqSchema(items) {
    var existing = document.getElementById("faq-schema");
    if (existing) existing.remove();

    var mainEntity = items
      .filter(function (item) {
        return item.question && item.answer;
      })
      .map(function (item) {
        return {
          "@type": "Question",
          name: String(item.question).trim(),
          acceptedAnswer: {
            "@type": "Answer",
            text: String(item.answer).trim()
          }
        };
      });

    if (!mainEntity.length) return;

    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "faq-schema";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: mainEntity
    });
    document.head.appendChild(script);
  }

  function showError() {
    var root = document.getElementById("faq-root");
    var error = document.getElementById("faq-error");
    var empty = document.getElementById("faq-empty");
    if (root) root.textContent = "";
    if (empty) empty.hidden = true;
    if (error) error.hidden = false;
  }

  function load() {
    P.setYear("faq-year");
    P.initNav();
    P.initAOS({ offset: 48 });

    P.fetchJSON("faq.json")
      .then(function (data) {
        applyPageMeta(data);
        renderFaq(data.items);
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
