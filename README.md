# Namaz Ka Waqt

A modern, responsive web dashboard for displaying local prayer times, dynamically fetched from a Google Sheet.

## 🌟 Features

*   **Live Data Sync**: Fetches prayer times directly from a published Google Sheet CSV.
*   **Smart Filtering**: Filter mosques by Area or specific Mosque Name.
*   **Grouped Display**: Automatically organizes mosques by their geographic area.
*   **Manual Refresh**: A refresh button to pull the latest data immediately, with visual feedback (Toast notifications).
*   **Urdu Support**: Native support for Urdu typography using the *Noto Nastaliq Urdu* font.
*   **Footer Notes**: Automatically detects and displays important announcements/notes from the bottom of the spreadsheet.
*   **Responsive Design**: Optimized for both mobile phones and desktop screens.

## 🚀 How to Launch the App (Locally)

To run this application on your computer, you need a local web server.

### Method 1: VS Code Live Server (Recommended)
1.  Open the project folder in **VS Code**.
2.  Install the **Live Server** extension (by Ritwick Dey).
3.  Right-click on `index.html` and select **"Open with Live Server"**.
4.  The app will open automatically in your browser.

### Method 2: Node.js
1.  Open your terminal in the project folder.
2.  Run `npx serve`.
3.  Open the URL shown (usually `http://localhost:3000`).

### Method 3: Python
1.  Open your terminal in the project folder.
2.  Run `python -m http.server`.
3.  Open `http://localhost:8000`.

## 🌐 Making it Public (Deployment)

To share the app with others, you can host it for free using these popular services.

### Option 1: Netlify Drop (Easiest)
1.  Go to [Netlify Drop](https://app.netlify.com/drop).
2.  Drag and drop your project folder onto the page.
3.  Netlify will upload the files and provide you with a public URL (e.g., `https://calm-sunrise-123456.netlify.app`) instantly.

### Option 2: Vercel
1.  Install the Vercel CLI: `npm i -g vercel`.
2.  Run the command `vercel` in your project folder.
3.  Follow the prompts (accept defaults).
4.  Vercel will build and deploy your site.

### Option 3: GitHub Pages
1.  Upload your code to a GitHub repository.
2.  Go to **Settings** > **Pages**.
3.  Under **Build and deployment**, select **Source** as `Deploy from a branch`.
4.  Select your branch (usually `main`) and save.

*Note: Since this project uses React with TypeScript, ensure your hosting environment is configured to serve the files correctly. For a production-grade deployment, we recommended using a build tool like Vite.*

## ⚙️ Configuration

### Changing the Data Source (Google Sheet)
To connect the app to your own Google Sheet:

1.  **Prepare the Sheet**: Ensure your sheet follows the [Data Structure](#-data-structure).
2.  **Publish to Web**:
    *   Open your Google Sheet.
    *   Go to **File** > **Share** > **Publish to web**.
    *   Select **Entire Document** and change format to **Comma-separated values (.csv)**.
    *   Click **Publish** and copy the link.
3.  **Update the Code**:
    *   Open `services/prayerService.ts`.
    *   Replace the `CSV_URL` constant with your new link:
    ```typescript
    const CSV_URL = "YOUR_NEW_CSV_LINK_HERE";
    ```

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

*   **Frontend**: React 19
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Data Parsing**: PapaParse
*   **Fonts**: Inter (English), Noto Nastaliq Urdu (Urdu)
