/* Straight row of reel cards. Scrolls on its own, and still moves with arrows or a swipe. */
(function () {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root || root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  var track = root.querySelector("[data-hero-track]");
  var viewport = root.querySelector("[data-hero-viewport]");
  if (!track || !viewport) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var offset = 0;
  var paused = false;
  var dragging = false;
  var pointerId = null;
  var lastX = 0;
  var moved = 0;
  var speed = 0.55;

  function loopWidth() {
    return track.scrollWidth / 2;
  }

  function wrap(value) {
    var width = loopWidth();
    if (!width) return 0;
    while (value < 0) value += width;
    while (value >= width) value -= width;
    return value;
  }

  function apply() {
    track.style.transform = "translate3d(" + -offset + "px,0,0)";
  }

  function step() {
    var card = track.querySelector("[data-hero-card]");
    if (!card) return 220;
    var styles = window.getComputedStyle(track.firstElementChild);
    var gap = parseFloat(styles.columnGap || styles.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }

  function tick() {
    if (!paused && !dragging && !reduce && !document.hidden) {
      offset = wrap(offset + speed);
      apply();
    }
    window.requestAnimationFrame(tick);
  }

  function nudge(direction) {
    offset = wrap(offset + direction * step());
    apply();
  }

  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  if (prev) {
    prev.addEventListener("click", function () {
      nudge(-1);
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      nudge(1);
    });
  }

  viewport.addEventListener("pointerdown", function (event) {
    if (event.button !== 0) return;
    dragging = true;
    pointerId = event.pointerId;
    lastX = event.clientX;
    moved = 0;
    if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", function (event) {
    if (!dragging || event.pointerId !== pointerId) return;
    var dx = event.clientX - lastX;
    lastX = event.clientX;
    moved += Math.abs(dx);
    offset = wrap(offset - dx);
    apply();
  });

  function endDrag(event) {
    if (!dragging || (event && event.pointerId !== pointerId)) return;
    dragging = false;
    pointerId = null;
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  track.addEventListener(
    "click",
    function (event) {
      if (moved < 8) return;
      event.preventDefault();
      event.stopPropagation();
      moved = 0;
    },
    true,
  );

  root.addEventListener("mouseenter", function () {
    paused = true;
  });
  root.addEventListener("mouseleave", function () {
    paused = false;
  });
  root.addEventListener("focusin", function () {
    paused = true;
  });
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) paused = false;
  });

  document.addEventListener("visibilitychange", function () {
    paused = document.hidden;
  });

  window.matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", function (event) {
    reduce = event.matches;
  });

  apply();
  window.requestAnimationFrame(tick);

  document.addEventListener("click", function (event) {
    var node = event.target;
    var play = null;
    while (node && node !== document) {
      if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute("data-video-embed") && root.contains(node)) {
        play = node;
        break;
      }
      node = node.parentNode;
    }
    if (!play || moved > 8) return;
    if (document.getElementById("offline-video")) return;
    event.preventDefault();
    var frame = document.createElement("div");
    frame.id = "offline-video";
    frame.setAttribute("role", "dialog");
    frame.style.cssText =
      "position:fixed;inset:0;z-index:80;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:16px;";
    frame.innerHTML =
      '<div style="width:min(960px,100%);background:#121212;color:#fff;border-radius:16px;padding:12px;">' +
      '<div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px;">' +
      "<strong></strong><button type=\"button\" data-close-video style=\"color:#fff;font-size:20px;line-height:1;\">×</button></div>" +
      '<div style="position:relative;padding-top:56.25%;"><iframe style="position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:8px;" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div>';
    frame.querySelector("strong").textContent = play.getAttribute("data-video-title") || "Video";
    var embed = play.getAttribute("data-video-embed");
    frame.querySelector("iframe").src = embed + (embed.indexOf("?") === -1 ? "?" : "&") + "autoplay=1";
    frame.addEventListener("click", function (click) {
      if (click.target === frame || click.target.hasAttribute("data-close-video")) frame.remove();
    });
    document.body.appendChild(frame);
  });
})();
