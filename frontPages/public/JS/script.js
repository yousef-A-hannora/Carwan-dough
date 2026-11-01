const body = document.querySelector("body"),
      modeToggle = body.querySelector(".mode-toggle");
      sidebar = body.querySelector("nav");
      sidebarToggle = body.querySelector(".sidebar-toggle");
      sidebarScrim = body.querySelector(".sidebar-scrim");

let getMode = localStorage.getItem("mode");
if(getMode && getMode ==="dark"){
    body.classList.toggle("dark");
}

let getStatus = localStorage.getItem("status");
if(getStatus && getStatus ==="close"){
    sidebar.classList.toggle("close");
}

// Highlight the active navigation link
const currentPath = window.location.pathname.replace(/\/$/, "") || "/";
sidebar.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("data-nav");
    if (currentPath === target || currentPath.startsWith(target + "/")) {
        link.classList.add("active");
    }
});

function toggleDarkMode(){
    body.classList.toggle("dark");
    if(body.classList.contains("dark")){
        localStorage.setItem("mode", "dark");
    }else{
        localStorage.setItem("mode", "light");
    }
}

modeToggle.addEventListener("click", toggleDarkMode);
modeToggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDarkMode();
    }
});

const isMobile = () => window.matchMedia("(max-width: 1024px)").matches;

function openMobileSidebar(){
    sidebar.classList.add("mobile-open");
    if (sidebarScrim) sidebarScrim.classList.add("show");
}
function closeMobileSidebar(){
    sidebar.classList.remove("mobile-open");
    if (sidebarScrim) sidebarScrim.classList.remove("show");
}

sidebarToggle.addEventListener("click", () => {
    if (isMobile()) {
        sidebar.classList.contains("mobile-open") ? closeMobileSidebar() : openMobileSidebar();
        return;
    }
    sidebar.classList.toggle("close");
    if(sidebar.classList.contains("close")){
        localStorage.setItem("status", "close");
    }else{
        localStorage.setItem("status", "open");
    }
})

if (sidebarScrim) {
    sidebarScrim.addEventListener("click", closeMobileSidebar);
}

// Close the drawer after picking a destination on mobile
sidebar.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", closeMobileSidebar);
});
