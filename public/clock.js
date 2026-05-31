// Shared helper: format timestamp nicely
function formatLocalTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Send record to proxy
async function addRecord(record) {
  try {
    const response = await fetch("https://gncare-proxy.onrender.com/addRecord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record)
    });
     
    if (!response.ok) throw new Error(`Server error: ${response.status}`);

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding record:", error);
    alert("❌ Network or server error.");
    return null;
  }
}

// Clock In
function clockIn() {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const now = new Date();
      const record = {
        name: "Pebbie",
        action: "clock-in",
        time: now.toISOString(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      };

      const response = await addRecord(record);
      if (response && response.success) {
        alert(`✅ Clock-in saved at ${formatLocalTime(now)}`);
      } else {
        alert("⚠️ Failed to save clock-in.");
      }
    },
    (error) => {
      console.error("Location error:", error);
      alert("⚠️ Unable to get location. Please allow location access.");
    }
  );
}

// Clock Out
function clockOut() {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const now = new Date();
      const record = {
        name: "Pebbie",
        action: "clock-out",
        time: now.toISOString(),
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      };

      const response = await addRecord(record);
      if (response && response.success) {
        alert(`✅ Clock-out saved at ${formatLocalTime(now)}`);
      } else {
        alert("⚠️ Failed to save clock-out.");
      }
    },
    (error) => {
      console.error("Location error:", error);
      alert("⚠️ Unable to get location. Please allow location access.");
    }
  );
}

// Attach handlers
document.getElementById("clockIn").addEventListener("click", clockIn);
document.getElementById("clockOut").addEventListener("click", clockOut);
