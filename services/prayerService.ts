import { AppData, Mosque, PrayerContext } from '../types';

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRw5_YHnfGjRyT5AhvMjYN7G7ODch9KPv4cSL7JFnl4Rkz5yoF3cOEmgGoQRvLpvlCUqIjQ5q5kLnTT/pub?gid=1868609533&single=true&output=csv";

export const fetchPrayerTimes = async (): Promise<AppData> => {
    try {
        // Append timestamp to prevent caching from Google Sheets or Browser
        const cacheBuster = `&t=${Date.now()}`;
        const response = await fetch(CSV_URL + cacheBuster, {
            cache: 'no-store',
            headers: {
                'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.statusText}`);
        }
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            if (!window.Papa) {
                reject(new Error("PapaParse not loaded"));
                return;
            }

            window.Papa.parse(csvText, {
                complete: (results: any) => {
                    try {
                        const data = processParsedData(results.data);
                        resolve(data);
                    } catch (e) {
                        reject(e);
                    }
                },
                error: (err: any) => {
                    reject(err);
                }
            });
        });

    } catch (error) {
        console.error("Error fetching prayer times:", error);
        throw error;
    }
};

const processParsedData = (rows: any[][]): AppData => {
    if (rows.length < 3) {
        throw new Error("CSV data is too short");
    }

    // 1. EXTRACT CONTEXT (Headers are at Index 1)
    // Python: df.iloc[1, 1], etc.
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

    const last_updated = rows[0][0] ? String(rows[0][0]) : undefined;

    // 2. PROCESS ROWS
    // Python drops 0 and 1, starts iterating.
    const processed_data: Mosque[] = [];
    const footer_data: string[] = [];
    let current_area = "General";
    let is_main_table = true;

    // Start from index 2
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        
        // Safety check for empty trailing rows
        if (row.length === 0) continue;

        const first_col_text = row[0] ? String(row[0]).trim() : "";
        const first_col_lower = first_col_text.toLowerCase();

        // --- CIRCUIT BREAKER ---
        // Enhanced detection for "Note:", "Notes", "Note", etc.
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
        const cleanTime = (val: any) => (val && String(val).trim() !== "" && String(val).trim() !== "nan") ? String(val).trim() : "";

        const fajr = cleanTime(row[1]);
        const zuhar = cleanTime(row[2]);
        const asr = cleanTime(row[3]);
        const isha = cleanTime(row[4]);
        const juma = cleanTime(row[5]);
        const urdu_name = cleanTime(row[6]);

        const has_any_time = [fajr, zuhar, asr, isha, juma].some(t => t !== "");

        // Skip completely empty rows
        if (!first_col_text && !has_any_time) continue;

        // Area Header Logic
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