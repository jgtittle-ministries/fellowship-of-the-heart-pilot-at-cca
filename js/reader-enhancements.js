(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const contentArea = document.querySelector("main") || document.body;

    // 1. Theme Selection & Persistence
    const savedTheme = localStorage.getItem("reader-theme") || "light";
    setTheme(savedTheme);

    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        setTheme(btn.getAttribute("data-theme"));
      });
    });

    function setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("reader-theme", theme);
      document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.getAttribute("data-theme") === theme);
      });
    }

    // 2. Reading Progress Bar
    const progressBar = document.getElementById("reading-progress-bar");
    window.addEventListener("scroll", () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressBar) {
        progressBar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
      }
    });

    // 3. Dynamic Read Time Calculation
    function updateReadTime() {
      const badge = document.getElementById("read-time-badge");
      if (!badge || !contentArea) return;

      const text = contentArea.innerText || "";
      const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      badge.innerText = `⏱️ ${minutes} min read`;
    }

    updateReadTime();

    // Re-trigger read time calculation when markdown routing changes content
    const observer = new MutationObserver(updateReadTime);
    if (contentArea) {
      observer.observe(contentArea, { childList: true, subtree: true });
    }
  });
})();
