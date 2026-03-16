import { db } from "./firebase-config.js";
import { ref, onValue, query, orderByChild, update, remove } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "password";

const ensureAdmin = () => {
  const stored = localStorage.getItem("adminAccess");
  if (stored === "true") {
    return true;
  }

  const username = window.prompt("Enter admin username");
  const password = window.prompt("Enter admin password");
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem("adminAccess", "true");
    return true;
  }

  window.location.href = "index.html";
  return false;
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

const tableBody = document.querySelector(".admin-table tbody");
const emptyState = document.querySelector(".admin-empty");
const logoutButton = document.getElementById("admin-logout");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("adminAccess");
    window.location.href = "index.html";
  });
}

const setBookingStatus = async (id, status) => {
  if (!id) {
    return;
  }
  await update(ref(db, `bookings/${id}`), { status });
};

const deleteBooking = async (id) => {
  if (!id) {
    return;
  }
  await remove(ref(db, `bookings/${id}`));
};

if (tableBody) {
  tableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    const bookingId = button.dataset.id;
    if (button.dataset.action === "complete") {
      await setBookingStatus(bookingId, "completed");
    }

    if (button.dataset.action === "pending") {
      await setBookingStatus(bookingId, "pending");
    }

    if (button.dataset.action === "delete") {
      const confirmDelete = window.confirm("Delete this booking?");
      if (confirmDelete) {
        await deleteBooking(bookingId);
      }
    }
  });
}

if (ensureAdmin() && tableBody) {
  const bookingsQuery = query(ref(db, "bookings"), orderByChild("createdAt"));

  onValue(bookingsQuery, (snapshot) => {
    tableBody.innerHTML = "";
    const data = snapshot.val();

    if (!data) {
      if (emptyState) {
        emptyState.hidden = false;
      }
      return;
    }

    if (emptyState) {
      emptyState.hidden = true;
    }

    Object.entries(data)
      .sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0))
      .forEach(([id, booking]) => {
        const row = document.createElement("tr");
        const status = booking.status || "pending";
        const statusClass = status === "completed" ? "is-complete" : "is-pending";
        row.innerHTML = `
          <td>${formatDate(booking.date)}</td>
          <td>${formatTime(booking.time)}</td>
          <td>${booking.firstName || ""} ${booking.lastName || ""}</td>
          <td>${booking.phone || "-"}</td>
          <td>${booking.email || "-"}</td>
          <td>${(booking.services || []).join(", ") || "-"}</td>
          <td><span class="admin-status ${statusClass}">${status}</span></td>
          <td class="admin-actions">
            <button type="button" data-action="pending" data-id="${id}">Pending</button>
            <button type="button" data-action="complete" data-id="${id}">Complete</button>
            <button type="button" data-action="delete" data-id="${id}">Delete</button>
          </td>
        `;
        tableBody.appendChild(row);
      });
  });
}
