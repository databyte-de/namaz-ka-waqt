import { AppData, Mosque, PrayerContext } from '../types';

// Access environment variables
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;

export const fetchPrayerTimes = async (): Promise<AppData> => {
    // 1. CONFIGURATION CHECK
    if (!APPS_SCRIPT_URL || !SECRET_KEY) {
        console.error("Missing Configuration: VITE_APPS_SCRIPT_URL or VITE_SECRET_KEY not found.");
        // If you are running locally, make sure you have a .env file.
        // If deploying, make sure secrets are set in GitHub Actions.
        throw new Error("System configuration error: Credentials missing.");
    }

    try {
        // 2. CONSTRUCT SECURE URL
        const url = new URL(APPS_SCRIPT_URL);
        // The Apps Script expects a parameter named 'secret'
        url.searchParams.append('secret', SECRET_KEY);
        // Add timestamp to prevent browser caching
        url.searchParams.append('t', String(Date.now()));

        // 3. FETCH DATA
        const response = await fetch(url.toString());
        
        if (!response.ok) {
            throw new Error(`Failed to connect to data source: ${response.statusText}`);
        }

        const csvText = await response.text();

        // 4. HANDLE SCRIPT ERRORS
        // The script returns "Error: ..." as plain text if the secret is wrong
        if (csvText.trim().startsWith("Error:")) {
            throw new Error(csvText);
        }

        // 5. PARSE CSV
        return new Promise((resolve, reject) => {
            if (!window.Papa) {
                reject(new Error("CSV Parser (PapaParse) not loaded"));
                return;
            }

            window.Papa.parse(csvText, {
                header: false,
                skipEmptyLines: false, // We keep empty lines to detect section breaks
                complete: (results: any) => {
                    try {
                        const data = processParsedData(results.data);
                        resolve(data);
                    } catch (e) {
                        console.error("Data Processing Error", e);
                        reject(e);
                    }
                },
                error: (err: any) => {
                    console.error("CSV Parse Error", err);
                    reject(err);
                }
            });
        });

    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

const processParsedData = (rows: any[][]): AppData => {
    if (!rows || rows.length < 3) {
        throw new Error("Data is too short or empty");
    }

    // 1. EXTRACT CONTEXT (Headers are at Index 1)
    const headerRow = rows[1];
    
    const getLabel = (text: any) => {
        if (!text) return "";
        const parts = String(text).split('-');
        return parts[parts.length - 1].trim();
    };

    const prayer_context: PrayerContext = {
        fajr: getLabel(headerRow[1]),
        zuhar: getLabel(headerRow[2]),
        asr: getLabel(headerRow[3]),
        isha: getLabel(headerRow[4]),
        juma: getLabel(headerRow[5])
    };

    // Row 0 usually contains the Last Updated Date in the first cell
    const last_updated = rows[0][0] ? String(rows[0][0]) : undefined;

    // 2. PROCESS ROWS
    const processed_data: Mosque[] = [];
    const footer_data: string[] = [];
    let current_area = "General";
    let is_main_table = true;

    // Start from index 2 (after date and headers)
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        
        // Safety check for empty trailing rows
        if (!row || row.length === 0) continue;

        const first_col_text = row[0] ? String(row[0]).trim() : "";
        const first_col_lower = first_col_text.toLowerCase();

        // --- CIRCUIT BREAKER ---
        // If we hit "Note:", we switch to footer mode
        if (first_col_lower.includes("note:") || first_col_lower === "note" || first_col_lower === "notes") {
            is_main_table = false;
        }

        // --- MODE 1: FOOTER PROCESSING ---
        if (!is_main_table) {
            const row_content = row
                .filter(val => val && String(val).trim() !== "")
                .map(val => String(val).trim())
                .join(" ");
            
            if (row_content) {
                footer_data.push(row_content);
            }
            continue;
        }

        // --- MODE 2: MOSQUE PROCESSING ---
        const cleanTime = (val: any) => {
            if (!val) return "";
            const s = String(val).trim();
            return (s === 'nan' || s === '') ? "" : s;
        };

        const fajr = cleanTime(row[1]);
        const zuhar = cleanTime(row[2]);
        const asr = cleanTime(row[3]);
        const isha = cleanTime(row[4]);
        const juma = cleanTime(row[5]);
        const urdu_name = cleanTime(row[6]);

        const has_any_time = [fajr, zuhar, asr, isha, juma].some(t => t !== "");

        // Skip completely empty rows
        if (!first_col_text && !has_any_time) continue;

        // Area Header Logic (Name exists, but NO times)
        if (first_col_text && !has_any_time) {
            current_area = first_col_text;
            continue;
        }

        // Valid Mosque Logic
        if (first_col_text && has_any_time) {
            processed_data.push({
                area: current_area,
                name_en: first_col_text,
                name_ur: urdu_name,
                times: {
                    fajr: { time: fajr, label: prayer_context.fajr },
                    zuhar: { time: zuhar, label: prayer_context.zuhar },
                    asr: { time: asr, label: prayer_context.asr },
                    isha: { time: isha, label: prayer_context.isha },
                    juma: { time: juma, label: prayer_context.juma }
                }
            });
        }
    }

    return {
        metadata: {
            prayer_names_ur: prayer_context,
            last_updated
        },
        mosques: processed_data,
        footer_notes: footer_data
    };
};