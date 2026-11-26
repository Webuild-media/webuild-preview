/* Offline preview helpers. Injected only into the static file:// export. */
(function () {
  function closest(node, selector) {
    while (node && node.nodeType === 1) {
      if (node.matches(selector)) return node;
      node = node.parentElement;
    }
    return null;
  }

  document.addEventListener(
    "click",
    function (event) {
      var menuButton = closest(event.target, '[aria-controls="mobile-nav"]');
      if (menuButton) {
        event.preventDefault();
        event.stopPropagation();
        var menu = document.getElementById("mobile-nav");
        if (!menu) return;
        menu.classList.toggle("hidden");
        menuButton.setAttribute("aria-expanded", menu.classList.contains("hidden") ? "false" : "true");
        return;
      }

      var filter = closest(event.target, "[data-filter]");
      if (filter) {
        event.preventDefault();
        event.stopPropagation();
        var name = filter.getAttribute("data-filter");
        document.querySelectorAll("[data-filter]").forEach(function (button) {
          var on = button === filter;
          button.setAttribute("aria-pressed", on ? "true" : "false");
          button.classList.toggle("bg-brand", on);
          button.classList.toggle("bg-[#f2f2f2]", !on);
        });
        document.querySelectorAll("[data-work-card]").forEach(function (card) {
          var show = name === "all" || card.getAttribute("data-category") === name;
          card.hidden = !show;
        });
        return;
      }

      var trigger = closest(event.target, '[data-slot="accordion-trigger"]');
      if (trigger) {
        event.preventDefault();
        event.stopPropagation();
        var item = closest(trigger, '[data-slot="accordion-item"]');
        var panel = item && item.querySelector('[data-slot="accordion-content"]');
        if (!panel) return;
        var opening = panel.hasAttribute("hidden") || panel.getAttribute("data-closed") !== null;
        if (opening) {
          panel.removeAttribute("hidden");
          panel.removeAttribute("data-closed");
          panel.setAttribute("data-open", "");
          trigger.removeAttribute("data-closed");
          trigger.setAttribute("aria-expanded", "true");
        } else {
          panel.setAttribute("hidden", "");
          panel.setAttribute("data-closed", "");
          panel.removeAttribute("data-open");
          trigger.setAttribute("aria-expanded", "false");
        }
        panel.style.animation = "none";
        panel.style.height = opening ? "auto" : "0";
        panel.style.overflow = opening ? "visible" : "hidden";
        var inner = panel.firstElementChild;
        if (inner) {
          inner.style.animation = "none";
          inner.style.setProperty("height", opening ? "auto" : "0", "important");
        }
        return;
      }

      var play = closest(event.target, "[data-video-embed]");
      if (play) {
        event.preventDefault();
        event.stopPropagation();
        var existing = document.getElementById("offline-video");
        if (existing) existing.remove();
        var frame = document.createElement("div");
        frame.id = "offline-video";
        frame.setAttribute("role", "dialog");
        frame.style.cssText =
          "position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;";
        frame.innerHTML =
          '<div style="width:min(960px,100%);background:#121212;color:#fff;border-radius:16px;padding:12px;">' +
          '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px;">' +
          "<strong></strong><button type=\"button\" data-close-video style=\"color:#fff;font-size:20px;\">×</button></div>" +
          '<div style="position:relative;padding-top:56.25%;"><iframe style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:8px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div>';
        frame.querySelector("strong").textContent = play.getAttribute("data-video-title") || "Video";
        frame.querySelector("iframe").src = play.getAttribute("data-video-embed");
        frame.addEventListener("click", function (click) {
          if (click.target === frame || click.target.hasAttribute("data-close-video")) frame.remove();
        });
        document.body.appendChild(frame);
        return;
      }

      var link = closest(event.target, "a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) return;
      if (!href.endsWith(".html")) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.href = new URL(href, window.location.href).toString();
    },
    true,
  );

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || form.tagName !== "FORM") return;
      event.preventDefault();
      event.stopPropagation();
      var note = document.createElement("div");
      note.setAttribute("role", "status");
      note.innerHTML = '<h2 class="text-4xl text-ink">Thank you!</h2>';
      form.replaceWith(note);
    },
    true,
  );
})();
