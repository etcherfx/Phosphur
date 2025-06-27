"use strict";

const form = document.getElementById("uv-form");
const address = document.getElementById("uv-address");
const searchEngine = document.getElementById("uv-search-engine");
const error = document.getElementById("uv-error");
const errorCode = document.getElementById("uv-error-code");
const frame = document.getElementById("uv-frame");

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	frame.style.display = "block";
	
	const themeContainer = document.querySelector('.theme-toggle-container');
	if (themeContainer) {
		themeContainer.style.display = 'none';
	}
	
	const wispUrl = `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`;
	
	if (await connection.getTransport() !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}
	
	frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
});

const lightBannerImg = new Image();
const darkBannerImg = new Image();
lightBannerImg.src = "bannerLight.png";
darkBannerImg.src = "bannerDark.png";

let themeToggle, themeIcon, body, html, bannerImg;
let isInitialized = false;

function initializeTheme() {
    if (isInitialized) return;
    
    themeToggle = document.getElementById("theme-toggle");
    themeIcon = themeToggle?.querySelector(".theme-icon");
    body = document.body;
    html = document.documentElement;
    bannerImg = document.getElementById("banner-img");
    
    if (!themeToggle || !themeIcon || !bannerImg) {
        requestAnimationFrame(initializeTheme);
        return;
    }
    
    const savedTheme = localStorage.getItem("theme");
    const isDarkMode = html.classList.contains("dark-theme") || body.classList.contains("dark-theme") || savedTheme === "dark";
    
    if (isDarkMode) {
        html.classList.add("dark-theme");
        body.classList.add("dark-theme");
        themeIcon.textContent = "☀️";
        bannerImg.src = darkBannerImg.src;
        localStorage.setItem("theme", "dark");
    } else {
        html.classList.remove("dark-theme");
        body.classList.remove("dark-theme");
        themeIcon.textContent = "🌙";
        bannerImg.src = lightBannerImg.src;
        localStorage.setItem("theme", "light");
    }
    
    themeToggle.addEventListener("click", toggleTheme, { passive: true });
    isInitialized = true;
}

function toggleTheme() {
    if (!isInitialized) return;
    
    const isDarkMode = body.classList.contains("dark-theme");
    
    themeIcon.classList.add("spin");
    
    setTimeout(() => {
        themeIcon.classList.remove("spin");
    }, 600);
    
    requestAnimationFrame(() => {
        if (isDarkMode) {
            html.classList.remove("dark-theme");
            body.classList.remove("dark-theme");
            themeIcon.textContent = "🌙";
            bannerImg.src = lightBannerImg.src;
            localStorage.setItem("theme", "light");
        } else {
            html.classList.add("dark-theme");
            body.classList.add("dark-theme");
            themeIcon.textContent = "☀️";
            bannerImg.src = darkBannerImg.src;
            localStorage.setItem("theme", "dark");
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme, { once: true });
} else {
    requestAnimationFrame(initializeTheme);
}
