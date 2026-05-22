(function () {
  "use strict";

  /* ── TEMA: clase html.dark + localStorage ── */
  var THEME_STORAGE_KEY = "supplynet-theme";
  var themeRoot = document.documentElement;
  var themeToggle = document.getElementById("theme-toggle");

  function themeIsDark() {
    return themeRoot.classList.contains("dark");
  }

  function themeApply(dark) {
    themeRoot.classList.toggle("dark", !!dark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch (e) {}
    themeSyncToggle();
  }

  function themeSyncToggle() {
    if (!themeToggle) return;
    var dark = themeIsDark();
    themeToggle.setAttribute("aria-pressed", dark ? "true" : "false");
    themeToggle.setAttribute(
      "aria-label",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.setAttribute(
      "title",
      dark ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      themeApply(!themeIsDark());
    });
  }
  themeSyncToggle();
})();

(function () {
  "use strict";

  /* ── SIDEBAR: colapso desktop + drawer móvil ── */
  var STORAGE_KEY = "supplynet-sidebar-collapsed";
  var DRAWER_MQ = window.matchMedia("(max-width: 639px)");

  var frame = document.getElementById("app-frame");
  var sidebar = document.getElementById("sidebar");
  var backdrop = document.getElementById("sidebar-backdrop");
  var toggle = document.getElementById("sidebar-toggle");
  var toggleMobile = document.getElementById("sidebar-toggle-mobile");
  var menuWrap = document.querySelector(".topbar__menu-wrap");
  var menuPanel = document.getElementById("mobile-nav-panel");

  if (!frame || !sidebar || !toggle) return;

  frame.classList.add("frame--sidebar-static");

  function endSidebarStatic() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        frame.classList.remove("frame--sidebar-static");
      });
    });
  }

  function isDrawerMode() {
    return DRAWER_MQ.matches;
  }

  function getLabels() {
    return sidebar.querySelectorAll(".nav-item__label");
  }

  function setLabelVisibility(collapsed) {
    getLabels().forEach(function (el) {
      if (collapsed && !isDrawerMode()) {
        el.setAttribute("aria-hidden", "true");
      } else {
        el.removeAttribute("aria-hidden");
      }
    });
  }

  function applyDesktopCollapsed(collapsed) {
    if (collapsed) {
      frame.classList.add("frame--sidebar-collapsed");
    } else {
      frame.classList.remove("frame--sidebar-collapsed");
    }
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute(
      "aria-label",
      collapsed ? "Expand sidebar" : "Collapse sidebar"
    );
    setLabelVisibility(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch (e) {}
  }

  function disclosureSetExpanded(btn, panel, group, expanded) {
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
    if (expanded) {
      panel.removeAttribute("hidden");
      if (group) group.classList.add("nav-group--expanded");
    } else {
      panel.setAttribute("hidden", "");
      if (group) group.classList.remove("nav-group--expanded");
    }
  }

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest(
      "button.nav-item--parent, button.mobile-nav-panel__parent"
    );
    if (!btn) return;
    var root = btn.closest(".nav-disclosure-root");
    if (!root || !root.contains(btn)) return;
    ev.preventDefault();
    var panelId = btn.getAttribute("aria-controls");
    if (!panelId) return;
    var panel = document.getElementById(panelId);
    if (!panel) return;
    var group = btn.closest(".nav-group");
    var inDesktopSidebar = sidebar.contains(btn) && !isDrawerMode();

    if (inDesktopSidebar && frame.classList.contains("frame--sidebar-collapsed")) {
      applyDesktopCollapsed(false);
      disclosureSetExpanded(btn, panel, group, true);
      return;
    }

    var open = btn.getAttribute("aria-expanded") === "true";
    disclosureSetExpanded(btn, panel, group, !open);
  });

  function syncMobileMenuAria(expanded) {
    if (toggleMobile) {
      toggleMobile.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggleMobile.setAttribute(
        "aria-label",
        expanded ? "Close navigation menu" : "Open navigation menu"
      );
    }
  }

  function isMenuPanelOpen() {
    return menuPanel && !menuPanel.hidden;
  }

  function openMobileNavPanel() {
    if (!menuPanel) return;
    if (typeof window.__supplynetCloseNotificationPanel === "function") {
      window.__supplynetCloseNotificationPanel();
    }
    menuPanel.hidden = false;
    backdrop.hidden = false;
    backdrop.setAttribute("aria-hidden", "false");
    requestAnimationFrame(function () {
      backdrop.classList.add("sidebar-backdrop--visible");
    });
    syncMobileMenuAria(true);
    document.body.classList.add("drawer-open");
  }

  function closeMobileNavPanel() {
    if (!menuPanel) return;
    menuPanel.hidden = true;
    backdrop.classList.remove("sidebar-backdrop--visible");
    document.body.classList.remove("drawer-open");
    syncMobileMenuAria(false);
    window.setTimeout(function () {
      if (!isMenuPanelOpen()) {
        backdrop.hidden = true;
        backdrop.setAttribute("aria-hidden", "true");
      }
    }, 0);
  }

  function syncFromStorage() {
    if (isDrawerMode()) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") {
        applyDesktopCollapsed(true);
      }
    } catch (e) {}
  }

  function onResize() {
    if (!isDrawerMode()) {
      closeMobileNavPanel();
      backdrop.hidden = true;
      backdrop.classList.remove("sidebar-backdrop--visible");
      backdrop.setAttribute("aria-hidden", "true");
      document.body.classList.remove("drawer-open");
      syncFromStorage();
      setLabelVisibility(frame.classList.contains("frame--sidebar-collapsed"));
    } else {
      frame.classList.remove("frame--sidebar-collapsed");
      closeMobileNavPanel();
      setLabelVisibility(false);
      syncMobileMenuAria(false);
    }
  }

  function onSidebarToggleClick() {
    if (isDrawerMode()) {
      if (isMenuPanelOpen()) {
        closeMobileNavPanel();
      } else {
        openMobileNavPanel();
      }
    } else {
      var next = !frame.classList.contains("frame--sidebar-collapsed");
      applyDesktopCollapsed(next);
    }
  }

  toggle.addEventListener("click", onSidebarToggleClick);
  if (toggleMobile) {
    toggleMobile.addEventListener("click", function (e) {
      e.stopPropagation();
      onSidebarToggleClick();
    });
  }

  if (menuWrap) {
    menuWrap.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }

  backdrop.addEventListener("click", function () {
    if (isDrawerMode()) closeMobileNavPanel();
  });

  document.addEventListener("click", function (e) {
    if (!isDrawerMode() || !menuPanel || menuPanel.hidden) return;
    if (menuWrap && !menuWrap.contains(e.target)) {
      closeMobileNavPanel();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isDrawerMode() && isMenuPanelOpen()) {
      closeMobileNavPanel();
      if (toggleMobile) toggleMobile.focus();
      else toggle.focus();
    }
  });

  if (menuPanel) {
    menuPanel.addEventListener("click", function (e) {
      if (e.target.closest(".mobile-nav-panel__link")) {
        closeMobileNavPanel();
      }
    });
  }

  DRAWER_MQ.addEventListener("change", onResize);
  window.addEventListener("resize", onResize);

  if (isDrawerMode()) {
    syncMobileMenuAria(false);
    getLabels().forEach(function (el) {
      el.removeAttribute("aria-hidden");
    });
  } else {
    syncFromStorage();
    setLabelVisibility(frame.classList.contains("frame--sidebar-collapsed"));
  }

  window.__supplynetCloseMobileNavPanel = closeMobileNavPanel;

  endSidebarStatic();
})();

/* ── TÍTULO WELCOME: animación de entrada ── */
(function () {
  "use strict";

  var welcome = document.querySelector(".welcome");
  if (!welcome) return;

  var pauseMs = 274;
  var idleMaxMs = 2016;

  function notifyWelcomeComplete() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var root = document.documentElement;
    var opMs =
      Math.round(
        parseFloat(getComputedStyle(root).getPropertyValue("--welcome-title-opacity-dur").trim()) * 1000
      ) || 720;
    var trMs =
      Math.round(
        parseFloat(getComputedStyle(root).getPropertyValue("--welcome-title-transform-dur").trim()) * 1000
      ) || 756;
    var opRedMs =
      Math.round(
        parseFloat(getComputedStyle(root).getPropertyValue("--welcome-title-opacity-dur-reduced").trim()) * 1000
      ) || 324;
    var fallbackMs = reduce ? opRedMs + 80 : Math.max(opMs, trMs) + 100;

    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      welcome.removeEventListener("transitionend", onTe);
      window.dispatchEvent(new CustomEvent("supplynet:welcome-complete"));
    }
    var gotOpacity = false;
    var gotTransform = false;
    function onTe(e) {
      if (e.target !== welcome) return;
      if (e.propertyName === "opacity") gotOpacity = true;
      if (e.propertyName === "transform") gotTransform = true;
      if (reduce && gotOpacity) finish();
      if (!reduce && gotOpacity && gotTransform) finish();
    }
    welcome.addEventListener("transitionend", onTe);
    window.setTimeout(finish, fallbackMs);
  }

  function showTitle() {
    welcome.classList.remove("welcome--pending");
    welcome.classList.add("welcome--visible");
    welcome.setAttribute("aria-busy", "false");
    notifyWelcomeComplete();
  }

  function afterIdle() {
    window.setTimeout(showTitle, pauseMs);
  }

  window.addEventListener(
    "load",
    function () {
      function queueIdle(fn) {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(fn, { timeout: idleMaxMs });
        } else {
          window.setTimeout(fn, 288);
        }
      }
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
          queueIdle(afterIdle);
        });
      } else {
        queueIdle(afterIdle);
      }
    },
    { once: true }
  );
})();

(function () {
  "use strict";

  /* ── BENTO SOLUTIONS PANEL ── */
  var wrap = document.querySelector(".solutions-wrap");
  var btn = document.getElementById("solutions-toggle");
  var panel = document.getElementById("solutions-panel");
  var closeBtn = document.getElementById("solutions-panel-close");

  if (!wrap || !btn || !panel) return;

  function isPanelOpen() {
    return panel.classList.contains("solutions-panel--open");
  }

  function openPanel() {
    panel.classList.add("solutions-panel--open");
    btn.setAttribute("aria-expanded", "true");
  }

  function closePanel() {
    panel.classList.remove("solutions-panel--open");
    btn.setAttribute("aria-expanded", "false");
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    if (isPanelOpen()) {
      closePanel();
    } else {
      openPanel();
    }
  });

  /* ── Domain pills filter ── */
  var pills = panel.querySelectorAll(".solutions-pill");

  function applyFilter(filter) {
    pills.forEach(function (p) {
      p.classList.toggle("solutions-pill--active", p.getAttribute("data-filter") === filter);
    });
    panel.querySelectorAll(".solution-card").forEach(function (card) {
      var match = filter === "all" || card.getAttribute("data-domain") === filter;
      card.hidden = !match;
    });
  }

  pills.forEach(function (pill) {
    pill.addEventListener("click", function (e) {
      e.stopPropagation();
      applyFilter(pill.getAttribute("data-filter"));
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      closePanel();
      btn.focus();
    });
  }

  /* Cerrar al hacer clic fuera del panel */
  document.addEventListener("click", function (e) {
    if (isPanelOpen() && !wrap.contains(e.target)) {
      closePanel();
    }
  });

  panel.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  /* Cerrar con Escape */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isPanelOpen()) {
      closePanel();
      btn.focus();
    }
  });
})();
