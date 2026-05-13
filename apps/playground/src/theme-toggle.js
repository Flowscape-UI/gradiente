import iconSun from "./assets/icon-sun.svg";
import iconMoon from "./assets/icon-moon.svg";

const THEME_STORAGE_KEY = "gradiente-playground-theme";

function getPreferredTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    document.documentElement.style.setProperty(
        "--theme-icon",
        `url("${theme === "dark" ? iconSun : iconMoon}")`
    );
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function setupThemeToggle() {
    const button = document.querySelector(".theme-toggle");

    if (!button) {
        throw new Error("Theme toggle button not found.");
    }

    let currentTheme = getPreferredTheme();
    applyTheme(currentTheme);
    button.addEventListener("click", () => {
        currentTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(currentTheme);
    });
}