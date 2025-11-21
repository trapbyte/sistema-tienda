const sidebar = document.querySelector(".sidebar");
const sidebarToggler = document.querySelector(".sidebar-toggler");
const menuToggler = document.querySelector(".menu-toggler");

let collapsedSidebarHeight = "56px";
let fullSidebarHeight = "calc(100vh - 32px)";

// Toggle sidebar's collapsed state (desktop)
if (sidebarToggler) {
  sidebarToggler.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
  });
}

// Toggle menu for mobile
const toggleMenu = (isMenuActive) => {
  if (window.innerWidth <= 1024) {
    sidebar.style.height = isMenuActive ? "auto" : collapsedSidebarHeight;
    if (menuToggler) {
      menuToggler.querySelector("span").innerText = isMenuActive ? "close" : "menu";
    }
  }
}

if (menuToggler) {
  menuToggler.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = sidebar.classList.toggle("menu-active");
    toggleMenu(isActive);
  });
}

// Cerrar menú al hacer click en un link (móvil)
document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 1024 && sidebar.classList.contains("menu-active")) {
      sidebar.classList.remove("menu-active");
      toggleMenu(false);
    }
  });
});

// Cerrar menú al hacer click fuera (móvil)
document.addEventListener("click", (e) => {
  if (window.innerWidth <= 1024 && 
      sidebar.classList.contains("menu-active") && 
      !sidebar.contains(e.target)) {
    sidebar.classList.remove("menu-active");
    toggleMenu(false);
  }
});

// Adjust sidebar on window resize
window.addEventListener("resize", () => {
  if (window.innerWidth >= 1024) {
    sidebar.style.height = fullSidebarHeight;
    sidebar.classList.remove("menu-active");
  } else {
    sidebar.classList.remove("collapsed");
    sidebar.style.height = sidebar.classList.contains("menu-active") ? "auto" : collapsedSidebarHeight;
  }
});

// Initialize on load
if (window.innerWidth <= 1024) {
  sidebar.style.height = collapsedSidebarHeight;
}
