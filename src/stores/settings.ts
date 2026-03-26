import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '../i18n';

const STORAGE_KEY = '@redalert_settings';

export interface AppSettings {
  selectedCities: string[];
  soundPreAlert: string;   // newsFlash - התרעה מקדימה
  soundAlert: string;      // missiles etc - התרעה
  soundEndAlert: string;   // endAlert - שחרור
  language: Language;
  receiveAll: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  selectedCities: [],
  soundPreAlert: 'digital_ping',
  soundAlert: 'gentle_chime',
  soundEndAlert: 'melodic_tone',
  language: 'he',
  receiveAll: true,
};

let cachedSettings: AppSettings = { ...DEFAULT_SETTINGS };

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      cachedSettings = { ...DEFAULT_SETTINGS, ...parsed };
    } else {
      cachedSettings = { ...DEFAULT_SETTINGS };
    }
  } catch {
    cachedSettings = { ...DEFAULT_SETTINGS };
  }
  return cachedSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  cachedSettings = { ...settings };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function getSettings(): AppSettings {
  return cachedSettings;
}

export async function updateSettings(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  const updated = { ...cachedSettings, ...partial };
  await saveSettings(updated);
  return updated;
}
