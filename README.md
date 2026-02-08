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

### Option 2: Production Preview (Python)
Use this if you just want to run the app locally using Python. **Note: You must build the app first.**

1.  **Build the App**:
    ```bash
    npm install   # (If not already installed)
    npm run build # This creates a 'dist' folder with the final files
    ```
2.  **Navigate to Build Folder**:
    ```bash
    cd dist
    ```
3.  **Start Python Server**:
    ```bash
    python3 -m http.server
    ```
4.  **Open in Browser**: Visit `http://localhost:8000`.

## 🌐 Making it Public (GitHub Pages)

To fix the blank page issue and deploy correctly, follow these steps:

1.  **Install Dependencies**:
    Run this command in your terminal to install the deployment tool:
    ```bash
    npm install
    ```

2.  **Deploy**:
    Run this command. It will automatically build your app and upload the correct files to GitHub.
    ```bash
    npm run deploy
    ```

3.  **Configure GitHub**:
    *   Go to your repository on GitHub.
    *   Click **Settings** > **Pages**.
    *   Under **Build and deployment** > **Branch**, ensure **`gh-pages`** is selected (Note: This branch is created automatically by the previous step).
    *   Click **Save**.

Wait a minute or two, refresh your site, and it should work!

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

*   **Frontend**: React 19, Vite
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Data Parsing**: PapaParse
*   **Fonts**: Inter (English), Noto Nastaliq Urdu (Urdu)
