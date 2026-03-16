import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";

const menu = document.querySelector("[data-user-menu]");

const trigger = menu ? menu.querySelector(".user-trigger") : null;
const nameEl = menu ? menu.querySelector(".user-name") : null;
const dropdown = menu ? menu.querySelector(".user-dropdown") : null;
const logoutButton = menu ? menu.querySelector(".user-logout") : null;
const loggedOutItems = menu ? menu.querySelectorAll("[data-auth='logged-out']") : [];
const loggedInItems = menu ? menu.querySelectorAll("[data-auth='logged-in']") : [];

let isLoggedIn = false;

const closeDropdown = () => {
  if (dropdown) {
    dropdown.hidden = true;
  }
  if (trigger) {
    trigger.setAttribute("aria-expanded", "false");
  }
};

const openDropdown = () => {
  if (dropdown) {
    dropdown.hidden = false;
  }
  if (trigger) {
    trigger.setAttribute("aria-expanded", "true");
  }
};

if (menu && trigger) {
  trigger.addEventListener("click", () => {
    if (!isLoggedIn) {
      window.location.href = "login.html";
      return;
    }

    if (dropdown && dropdown.hidden) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });
}

if (menu && logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    closeDropdown();
    window.location.href = "index.html";
  });
}

if (menu) {
  window.addEventListener("click", (event) => {
    if (!menu.contains(event.target)) {
      closeDropdown();
    }
  });
}

if (menu) {
  onAuthStateChanged(auth, (user) => {
    isLoggedIn = Boolean(user);

    if (!user) {
      if (nameEl) {
        nameEl.textContent = "Account";
      }
      loggedOutItems.forEach((item) => {
        item.hidden = false;
      });
      loggedInItems.forEach((item) => {
        item.hidden = true;
      });
      closeDropdown();
      return;
    }

    const displayName = user.displayName || (user.email ? user.email.split("@")[0] : "Account");
    if (nameEl) {
      nameEl.textContent = displayName;
    }
    loggedOutItems.forEach((item) => {
      item.hidden = true;
    });
    loggedInItems.forEach((item) => {
      item.hidden = false;
    });
  });
}
