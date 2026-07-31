// --- CONFIGURATION ---
const NTFY_TOPIC = "subedar_alerts"; // Your new topic
const TARGET_MOSQUE_NAME = "Subedar Masjid-Hospital Road";
const ALERT_MINUTES_BEFORE = 15; // Send alert 15 mins before Jamaat

// --- MAIN FUNCTION TO TRIGGER ---
function checkAndSendIPhoneAlerts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  let mosqueRow = null;
  for (let i = 2; i < data.length; i++) { 
    if (data[i][0] === TARGET_MOSQUE_NAME) {
      mosqueRow = data[i];
      break;
    }
  }

  if (!mosqueRow) {
    console.error("Mosque not found.");
    return;
  }

  const times = {
    "Fajr (فجر)": mosqueRow[1],
    "Zuhar (ظہر)": mosqueRow[2],
    "Asr (عصر)": mosqueRow[3],
    "Isha (عشاء)": mosqueRow[4],
    "Juma (جمعہ)": mosqueRow[5]
  };

  const now = new Date();

  for (const [prayerName, timeString] of Object.entries(times)) {
    if (!timeString || timeString === "" || timeString === "nan") continue;

    const jamaatTime = parseTimeStringToDate(timeString, prayerName);
    
    // Calculate difference in minutes
    const diffMs = jamaatTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    // If exactly 15 minutes before, send the iPhone push notification
    if (diffMins === ALERT_MINUTES_BEFORE) {
      const title = `🕌 ${prayerName} Jamaat`;
      const message = `${TARGET_MOSQUE_NAME} Jamaat is in ${ALERT_MINUTES_BEFORE} minutes (at ${timeString}).`;
      
      sendIPhoneNotification(title, message);
    }
  }
}

// --- HELPER: PARSE TIMES ---
function parseTimeStringToDate(timeStr, prayerName) {
  const [hoursStr, minutesStr] = String(timeStr).split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (prayerName.includes("Fajr")) {
    if (hours === 12) hours = 0; 
  } else {
    if (hours < 12) hours += 12;
  }

  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// --- HELPER: SEND NTFY PUSH NOTIFICATION ---
function sendIPhoneNotification(title, message) {
  const url = `https://ntfy.sh/${NTFY_TOPIC}`;
  
  const options = {
    method: "post",
    payload: message,
    headers: {
      "Title": title,
      "Tags": "mosque,warning", 
      "Priority": "high" 
    }
  };

  try {
    UrlFetchApp.fetch(url, options);
    console.log("Push notification sent: " + message);
  } catch (e) {
    console.error("Failed to send notification: " + e.message);
  }
}
