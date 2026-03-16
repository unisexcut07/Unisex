import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import {
  ref,
  query,
  orderByChild,
  equalTo,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const signupForm = document.getElementById("signup-form");
const signinForm = document.getElementById("signin-form");
const logoutButton = document.getElementById("logout-btn");
const statusEl = document.querySelector(".account-status");
const historyList = document.querySelector(".history-list");
const historyEmpty = document.querySelector(".history-empty");

let unsubscribeBookings = null;

const setStatus = (message, isError = false) => {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message;
  statusEl.dataset.state = isError ? "error" : "success";
};

const setHistoryEmpty = (message) => {
  if (!historyEmpty) {
    return;
  }
  historyEmpty.textContent = message;
  historyEmpty.hidden = false;
};

const clearHistory = () => {
  if (!historyList) {
    return;
  }
  historyList.innerHTML = "";
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) {
    return "-";
  }
  const parsed = new Date(`1970-01-01T${value}`);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nameInput = document.getElementById("signup-name");
    const fullName = nameInput ? nameInput.value.trim() : "";
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();

    if (!fullName) {
      setStatus("Please enter your full name.", true);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: fullName });
      }
      signupForm.reset();
      alert("Account created successfully. Please sign in.");
      setStatus("Account created. Please sign in.");
      window.location.href = "login.html";
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

if (signinForm) {
  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value.trim();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      signinForm.reset();
      setStatus("Signed in successfully.");
      window.location.href = "history.html";
    } catch (error) {
      setStatus(error.message, true);
    }
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await signOut(auth);
    setStatus("Signed out.");
  });
}

onAuthStateChanged(auth, (user) => {
  if (!user && historyList && !statusEl) {
    window.location.href = "login.html";
    return;
  }

  if (unsubscribeBookings) {
    unsubscribeBookings();
    unsubscribeBookings = null;
  }

  if (!user) {
    setStatus("");
    clearHistory();
    setHistoryEmpty("Sign in to view your bookings.");

    if (logoutButton) {
      logoutButton.hidden = true;
    }
    return;
  }

  if (logoutButton) {
    logoutButton.hidden = false;
  }

  setStatus("");
  clearHistory();
  if (historyEmpty) {
    historyEmpty.hidden = true;
  }

  if (!historyList) {
    return;
  }

  const userQuery = query(ref(db, "bookings"), orderByChild("userId"), equalTo(user.uid));
  unsubscribeBookings = onValue(userQuery, (snapshot) => {
    clearHistory();
    const data = snapshot.val();

    if (!data) {
      setHistoryEmpty("No bookings yet.");
      return;
    }

    Object.values(data)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .forEach((booking) => {
        const item = document.createElement("li");
        const services = (booking.services || []).join(", ") || "-";
        item.innerHTML = `
          <span class="history-date">${formatDate(booking.date)} ${formatTime(booking.time)}</span>
          <span class="history-services">${services}</span>
          <span class="history-status ${booking.status === "completed" ? "is-complete" : "is-pending"}">
            ${booking.status || "pending"}
          </span>
        `;
        historyList.appendChild(item);
      });
  });
});
