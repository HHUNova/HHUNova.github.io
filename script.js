const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const header = document.querySelector(".site-header");
const scrollProgress = document.querySelector(".scroll-progress");
const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const storage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      return null;
    }
  },
};

const storedTheme = storage.get("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

root.classList.add("js");
root.dataset.theme = storedTheme || (prefersDark ? "dark" : "light");

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  storage.set("theme", nextTheme);
});

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 8);
};

const setScrollProgress = () => {
  if (!scrollProgress) return;

  const maxScroll = root.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;
  root.style.setProperty("--scroll-progress", progress.toFixed(4));
};

const updateScrollEffects = () => {
  setHeaderState();
  setScrollProgress();
};

updateScrollEffects();
window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", setScrollProgress);

const revealItems = document.querySelectorAll("[data-reveal]");
const revealFallback = window.setTimeout(() => {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}, 600);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if ("IntersectionObserver" in window) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visible) return;

      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
      });
    },
    {
      rootMargin: "-25% 0px -55% 0px",
      threshold: [0.1, 0.3, 0.6],
    }
  );

  sections.forEach((section) => navObserver.observe(section));
}

const tiltCards = Array.from(document.querySelectorAll("[data-tilt]"));
const canUsePointerMotion =
  !motionQuery.matches && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (canUsePointerMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      const rotateX = (50 - y) / 24;
      const rotateY = (x - 50) / 24;

      card.style.setProperty("--mx", `${x.toFixed(2)}%`);
      card.style.setProperty("--my", `${y.toFixed(2)}%`);
      card.style.transform = `translateY(-4px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
      card.style.transform = "";
    });
  });
}
