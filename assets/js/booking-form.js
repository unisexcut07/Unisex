import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";

const form = document.querySelector(".appoitment-form");
const statusEl = document.querySelector(".form-status");
const emailInput = document.getElementById("email");
const dateInput = document.getElementById("date");
let currentUser = null;

const readServices = () => {
  const selections = [];
  const fields = [
    { id: "haircut-checkbox", label: "Haircut" },
    { id: "beard-trim-checkbox", label: "Beard Trim" },
    { id: "shave-checkbox", label: "Shave" }
  ];

  fields.forEach((field) => {
    const input = document.getElementById(field.id);
    if (input && input.checked) {
      selections.push(field.label);
    }
  });

  return selections;
};

const setStatus = (message, isError = false) => {
  if (!statusEl) {
    return;
  }
  statusEl.textContent = message;
  statusEl.dataset.state = isError ? "error" : "success";
};

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user && emailInput && !emailInput.value) {
    emailInput.value = user.email || "";
  }
});

if (dateInput) {
  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];
  dateInput.min = isoToday;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("");

    const services = readServices();
    if (services.length === 0) {
      setStatus("Please select at least one service.", true);
      return;
    }

    const selectedDate = document.getElementById("date").value;
    if (selectedDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(`${selectedDate}T00:00:00`);
      if (chosen < today) {
        setStatus("Please select today or a future date.", true);
        return;
      }
    }

    const selectedTime = document.getElementById("time").value;
    if (selectedTime < "09:00" || selectedTime > "23:00") {
      setStatus("Please select a time between 09:00 and 23:00.", true);
      return;
    }

    if (!currentUser) {
      setStatus("Please sign in before booking an appointment.", true);
      window.setTimeout(() => {
        window.location.href = "signup.html";
      }, 600);
      return;
    }

    const firstName = document.getElementById("f_name").value.trim();
    const lastName = document.getElementById("l_name").value.trim();
    const fullName = `${firstName} ${lastName}`.trim();

    const booking = {
      firstName,
      lastName,
      phone: document.getElementById("p_number").value.trim(),
      email: document.getElementById("email").value.trim(),
      date: document.getElementById("date").value,
      time: selectedTime,
      services,
      status: "pending",
      userId: currentUser.uid,
      userEmail: currentUser.email || "",
      userName: currentUser.displayName || fullName,
      createdAt: Date.now()
    };

    try {
      await push(ref(db, "bookings"), booking);
      form.reset();
      setStatus("Booking received. We will contact you shortly.");
    } catch (error) {
      console.error(error);
      setStatus("Unable to submit booking. Please try again.", true);
    }
  });
}
