export interface AlertTypeInfo {
  key: string;
  he: string;
  en: string;
  emoji: string;
  isDrill: boolean;
  color: string;
}

export const ALERT_TYPES: Record<string, AlertTypeInfo> = {
  missiles: {
    key: 'missiles',
    he: 'ירי רקטות וטילים',
    en: 'Missiles',
    emoji: '🚀',
    isDrill: false,
    color: '#e94560',
  },
  radiologicalEvent: {
    key: 'radiologicalEvent',
    he: 'אירוע רדיולוגי',
    en: 'Radiological Event',
    emoji: '☢️',
    isDrill: false,
    color: '#ff6b35',
  },
  earthQuake: {
    key: 'earthQuake',
    he: 'רעידת אדמה',
    en: 'Earthquake',
    emoji: '🌍',
    isDrill: false,
    color: '#c44536',
  },
  tsunami: {
    key: 'tsunami',
    he: 'צונאמי',
    en: 'Tsunami',
    emoji: '🌊',
    isDrill: false,
    color: '#3a86ff',
  },
  hostileAircraftIntrusion: {
    key: 'hostileAircraftIntrusion',
    he: 'חדירת כלי טיס עוין',
    en: 'Hostile Aircraft Intrusion',
    emoji: '✈️',
    isDrill: false,
    color: '#ff006e',
  },
  hazardousMaterials: {
    key: 'hazardousMaterials',
    he: 'חומרים מסוכנים',
    en: 'Hazardous Materials',
    emoji: '⚠️',
    isDrill: false,
    color: '#ffbe0b',
  },
  terroristInfiltration: {
    key: 'terroristInfiltration',
    he: 'חדירת מחבלים',
    en: 'Terrorist Infiltration',
    emoji: '🔫',
    isDrill: false,
    color: '#d62828',
  },
  newsFlash: {
    key: 'newsFlash',
    he: 'חדשות בזק',
    en: 'News Flash',
    emoji: '📢',
    isDrill: false,
    color: '#4895ef',
  },
  endAlert: {
    key: 'endAlert',
    he: 'סוף ההתרעה',
    en: 'Alert Ended',
    emoji: '✅',
    isDrill: false,
    color: '#2dc653',
  },
  // Drill versions
  missilesDrill: {
    key: 'missilesDrill',
    he: 'תרגיל ירי רקטות וטילים',
    en: 'Missiles Drill',
    emoji: '🚀',
    isDrill: true,
    color: '#f4845f',
  },
  radiologicalEventDrill: {
    key: 'radiologicalEventDrill',
    he: 'תרגיל אירוע רדיולוגי',
    en: 'Radiological Event Drill',
    emoji: '☢️',
    isDrill: true,
    color: '#f4845f',
  },
  earthQuakeDrill: {
    key: 'earthQuakeDrill',
    he: 'תרגיל רעידת אדמה',
    en: 'Earthquake Drill',
    emoji: '🌍',
    isDrill: true,
    color: '#f4845f',
  },
  tsunamiDrill: {
    key: 'tsunamiDrill',
    he: 'תרגיל צונאמי',
    en: 'Tsunami Drill',
    emoji: '🌊',
    isDrill: true,
    color: '#f4845f',
  },
  hostileAircraftIntrusionDrill: {
    key: 'hostileAircraftIntrusionDrill',
    he: 'תרגיל חדירת כלי טיס עוין',
    en: 'Hostile Aircraft Intrusion Drill',
    emoji: '✈️',
    isDrill: true,
    color: '#f4845f',
  },
  hazardousMaterialsDrill: {
    key: 'hazardousMaterialsDrill',
    he: 'תרגיל חומרים מסוכנים',
    en: 'Hazardous Materials Drill',
    emoji: '⚠️',
    isDrill: true,
    color: '#f4845f',
  },
  terroristInfiltrationDrill: {
    key: 'terroristInfiltrationDrill',
    he: 'תרגיל חדירת מחבלים',
    en: 'Terrorist Infiltration Drill',
    emoji: '🔫',
    isDrill: true,
    color: '#f4845f',
  },
};

export function getAlertTypeInfo(type: string): AlertTypeInfo {
  return (
    ALERT_TYPES[type] ?? {
      key: type,
      he: type,
      en: type,
      emoji: '❓',
      isDrill: false,
      color: '#e94560',
    }
  );
}
