# Namaz Ka Waqt

A modern, responsive web dashboard for displaying local prayer times, dynamically fetched from a private Google Sheet via a secure Apps Script proxy.

## 🌟 Features

* **Secure Data Fetching**: Uses a Google Apps Script proxy with a secret token to fetch data securely without exposing the sheet publicly.
* **Live Data Sync**: Updates automatically when the Google Sheet is edited.
* **Smart Filtering**: Filter mosques by Area or specific Mosque Name.
* **Grouped Display**: Automatically organizes mosques by their geographic area.
* **Manual Refresh**: A refresh button to pull the latest data immediately, with visual feedback (Toast notifications).
* **Urdu Support**: Native support for Urdu typography using the *Noto Nastaliq Urdu* font.
* **Footer Notes**: Automatically detects and displays important announcements/notes from the bottom of the spreadsheet.
* **Responsive Design**: Optimized for both mobile phones and desktop screens.

## 🚀 How to Launch the App

Since this is a modern React application using TypeScript, you have two options to run it:

### Option 1: Development Mode (Node.js) - Recommended
Use this if you want to edit code and see changes instantly.

1.  **Install Node.js**: Download from [nodejs.org](https://nodejs.org/).
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Start the Server**:
    ```bash
    npm run dev
    ```
4.  **Open in Browser**: Visit the URL shown in terminal (usually `http://localhost:5173`).

### Option 2: Production Preview
Use this to test the final build locally.

1.  **Build the App**:
    ```bash
    npm run build
    ```
2.  **Preview**:
    ```bash
    npm run preview
    ```

## 🌐 Deployment (GitHub Pages)

To deploy this app to the web for free:

1.  **Deploy Command**:
    Run this command. It will automatically build your app and upload the correct files to the `gh-pages` branch.
    ```bash
    npm run deploy
    ```

2.  **Configure GitHub**:
    * Go to your repository on GitHub.
    * Click **Settings** > **Pages**.
    * Under **Build and deployment** > **Branch**, ensure **`gh-pages`** is selected.
    * Click **Save**.

## ⚙️ Configuration (Google Sheets Backend)

This app uses a **Google Apps Script** to turn your private sheet into a secure JSON/CSV API.

### Step 1: Prepare the Google Sheet
Ensure your sheet follows the [Data Structure](#-data-structure) below.

### Step 2: Create the API Script
1.  Open your Google Sheet.
2.  Go to **Extensions** > **Apps Script**.
3.  Paste the following code into `Code.gs`:

```javascript
function doGet(e) {
  // SECURITY: Change this secret to something unique
  if (e.parameter.secret !== 'YOUR_SECRET_KEY_HERE') {
    return ContentService.createTextOutput("Error: Access Denied. Wrong Secret.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  
  // CRITICAL: Use getDisplayValues() to get "06:20" text, avoiding Date object conversion issues
  var data = sheet.getDataRange().getDisplayValues();

  // Convert 2D Array to CSV format manually
  var csvString = data.map(function(row) {
    return row.map(function(cell) {
      var cellText = cell.toString();
      cellText = cellText.replace(/"/g, '""');
      if (cellText.search(/("|,|\n)/g) >= 0) {
        cellText = '"' + cellText + '"';
      }
      return cellText;
    }).join(",");
  }).join("\n");

  return ContentService.createTextOutput(csvString)
    .setMimeType(ContentService.MimeType.CSV);
}

### Step 3: Deploy the Script (Critical!)
1. Click the blue Deploy button > New deployment.
2. Select type: Web app.
3. Description: Prayer API v1
4 .Execute as: Me (Your email).
5. Who has access: Anyone (Important: This avoids CORS errors).
6. Click Deploy and copy the Web App URL.

###Step 4: Connect to Frontend
Open services/prayerService.ts and update the configuration:

TypeScript
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';

## 📊 Data Structure

The application expects the Google Sheet to follow a specific structure:

1.  **Row 1**: Metadata (Cell A1 usually contains the "Last Updated" date).
2.  **Row 2**: Headers (Mosque, Fajr, Zuhar, Asr, Isha, Juma, Urdu Name).
3.  **Row 3+**: Data rows.
    *   **Column A**: Mosque Name (or Area Name if no times are provided).
    *   **Columns B-F**: Prayer Times.
    *   **Column G**: Urdu Name.
4.  **Notes Section**:
    *   Any row starting with **"Note"** or **"Notes"** marks the beginning of the footer section.
    *   All content below this row is displayed in the information box.

## 🛠️ Tech Stack

*   **Frontend**: React 19, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Data Parsing**: PapaParse
*   **Fonts**: Inter (English), Noto Nastaliq Urdu (Urdu)
