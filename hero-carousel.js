/* Featured-film carousel. Works from a static file with no server. */
(function () {
  var root = document.querySelector("[data-hero-carousel]");
  if (!root || root.dataset.ready === "true") return;
  root.dataset.ready = "true";

  var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
  var caption = root.querySelector("[data-hero-caption]");
  var index = 0;
  var timer = 0;
  var startX = 0;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(next) {
    if (!slides.length) return;
    index = (next + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      var on = i === index;
      slide.hidden = !on;
      slide.setAttribute("aria-hidden", on ? "false" : "true");
    });
    dots.forEach(function (dot, i) {
      var on = i === index;
      dot.setAttribute("aria-current", on ? "true" : "false");
      dot.style.width = on ? "2rem" : "0.5rem";
      dot.style.background = on ? "#FF6D00" : "rgba(255,255,255,0.35)";
    });
    if (caption) {
      var slide = slides[index];
      var client = slide.getAttribute("data-client") || "";
      var title = slide.getAttribute("data-title") || "";
      caption.textContent = client ? client + " — " + title : title;
    }
  }

  function stop() {
    window.clearInterval(timer);
    timer = 0;
  }

  function start() {
    stop();
    if (reduce || slides.length < 2 || document.hidden) return;
    timer = window.setInterval(function () {
      show(index + 1);
    }, 6500);
  }

  var prev = root.querySelector("[data-hero-prev]");
  var next = root.querySelector("[data-hero-next]");
  if (prev) {
    prev.addEventListener("click", function () {
      show(index - 1);
      start();
    });
  }
  if (next) {
    next.addEventListener("click", function () {
      show(index + 1);
      start();
    });
  }
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      show(i);
      start();
    });
  });

  root.addEventListener("pointerdown", function (event) {
    if (event.target.closest("[data-hero-prev], [data-hero-next], [data-hero-dot], [data-video-embed]")) return;
    startX = event.clientX;
  });
  root.addEventListener("pointerup", function (event) {
    if (!startX) return;
    var delta = event.clientX - startX;
    startX = 0;
    if (Math.abs(delta) > 40) show(index + (delta < 0 ? 1 : -1));
    start();
  });

  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);
  root.addEventListener("focusin", stop);
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) start();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });

  show(0);
  start();
})();
