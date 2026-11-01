/* Carwan Dough — shared customer UI behaviour */
(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* mark JS as active (progressive enhancement for .cd-reveal) */
    document.documentElement.classList.add("js");

    /* ---- header shadow on scroll ---- */
    function initHeader() {
        var header = document.getElementById("cd-header");
        if (!header) return;
        var onScroll = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
    }

    /* ---- logout confirmation ---- */
    function initLogout() {
        var logoutLink = document.getElementById("logout-link");
        if (!logoutLink) return;
        logoutLink.addEventListener("click", function (event) {
            event.preventDefault();
            if (typeof Swal === "undefined") {
                window.location.href = logoutLink.href;
                return;
            }
            Swal.fire({
                title: "really want to logout",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#C01836",
                cancelButtonColor: "#6B3A46",
                confirmButtonText: "Yes, logout!",
                cancelButtonText: "Cancel"
            }).then(function (result) {
                if (result.isConfirmed) {
                    window.location.href = logoutLink.href;
                }
            });
        });
    }

    /* ---- scroll reveal ---- */
    function initReveal() {
        var items = document.querySelectorAll(".cd-reveal");
        window.__cdReveal = true; // tells the head failsafe we are running
        if (!items.length) return;
        if (reduceMotion || !("IntersectionObserver" in window)) {
            items.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -32px 0px" });
        items.forEach(function (el) { observer.observe(el); });
    }

    /* ---- category image crossfade (home menu cards) ---- */
    function initSliders() {
        var sliders = document.querySelectorAll(".slider");
        if (!sliders.length) return;
        sliders.forEach(function (slider) {
            var sliderId = slider.getAttribute("data-slider-id");
            var slides = slider.querySelectorAll(".slide-" + sliderId);
            if (slides.length < 2 || reduceMotion) return;
            var index = 0;
            setInterval(function () {
                slides[index].classList.remove("is-active");
                index = (index + 1) % slides.length;
                slides[index].classList.add("is-active");
            }, 3500);
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initHeader();
        initLogout();
        initReveal();
        initSliders();
    });
})();
