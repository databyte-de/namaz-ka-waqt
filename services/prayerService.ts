import { AppData, Mosque, PrayerContext } from '../types';

// Hardcoded Configuration
// const APPS_SCRIPT_URL = '';
const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || '';
// const SECRET_KEY = '';
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || '';
// Fallback: Direct Google Sheet CSV (Robust against CORS/Script errors)
// const DIRECT_CSV_URL = "";

// Validation: Ensure secrets are present
if (!APPS_SCRIPT_URL || !SECRET_KEY) {
    console.warn("Missing Configuration: VITE_APPS_SCRIPT_URL or VITE_SECRET_KEY is not set.");
}

export const fetchPrayerTimes = async (): Promise<AppData> => {
    if (!window.Papa) {
        throw new Error("CSV Parser (PapaParse) not loaded");
    }

    // Helper: Parse CSV text into AppData
    const parseData = (csvText: string): Promise<AppData> => {
        return new Promise((resolve, reject) => {
            window.Papa.parse(csvText, {
                header: false,
                skipEmptyLines: false,
                complete: (results: any) => {
                    try {
                        const data = processParsedData(results.data);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                },
                error: (err: any) => reject(err)
            });
        });
    };

    // 1. Try Primary Source (Apps Script)
    try {
        const url = new URL(APPS_SCRIPT_URL);
        url.searchParams.append('secret', SECRET_KEY);
        url.searchParams.append('t', String(Date.now()));

        const response = await fetch(url.toString(), {
            method: 'GET',
            credentials: 'omit', // Fixes CORS issues with Google Auth redirects
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`Apps Script Status: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();

        // Handle Script-level errors
        if (csvText.trim().startsWith("Error:")) {
            throw new Error(csvText);
        }

        return await parseData(csvText);

    } catch (primaryError: any) {
        console.warn("Primary source failed, attempting fallback...", primaryError);

        // 2. Try Fallback Source (Direct CSV)
        // try {
        //     const response = await fetch(DIRECT_CSV_URL);
            
        //     if (!response.ok) {
        //         throw new Error(`Fallback Status: ${response.status}`);
        //     }

        //     const csvText = await response.text();
        //     return await parseData(csvText);

        // } catch (fallbackError) {
        //     console.error("All data sources failed.", fallbackError);
        //     // Throw a unified error for the UI to catch
        //     throw new Error("Unable to load prayer times. Please check your internet connection.");
        // }
        throw primaryError;
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