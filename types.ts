export interface PrayerLabel {
    time: string;
    label: string;
}

export interface PrayerTimes {
    fajr: PrayerLabel;
    zuhar: PrayerLabel;
    asr: PrayerLabel;
    isha: PrayerLabel;
    juma: PrayerLabel;
}

export interface Mosque {
    area: string;
    name_en: string;
    name_ur: string;
    times: PrayerTimes;
}

export interface PrayerContext {
    fajr: string;
    zuhar: string;
    asr: string;
    isha: string;
    juma: string;
}

export interface AppData {
    metadata: {
        prayer_names_ur: PrayerContext;
        last_updated?: string;
    };
    mosques: Mosque[];
    footer_notes: string[];
}

// Declare PapaParse globally since we load it via CDN
declare global {
    interface Window {
        Papa: any;
    }
}
