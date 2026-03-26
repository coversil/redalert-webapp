import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AreaSearch, { CityData } from '../components/AreaSearch';
import { AppSettings } from '../stores/settings';
import { Language, t } from '../i18n';

interface AreaPickerScreenProps {
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onGoBack: () => void;
}

export default function AreaPickerScreen({
  settings,
  onUpdateSettings,
  onGoBack,
}: AreaPickerScreenProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([
    ...settings.selectedCities,
  ]);
  const [detecting, setDetecting] = useState(false);
  const strings = t(settings.language);
  const isRTL = settings.language === 'he';

  const toggleCity = (name: string) => {
    setSelectedCities((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    );
  };

  const selectZone = (_zone: string, cities: CityData[]) => {
    setSelectedCities((prev) => {
      const newNames = cities.map((c) => c.name);
      const combined = new Set([...prev, ...newNames]);
      return Array.from(combined);
    });
  };

  const deselectZone = (_zone: string, cities: CityData[]) => {
    const zoneNames = new Set(cities.map((c) => c.name));
    setSelectedCities((prev) => prev.filter((n) => !zoneNames.has(n)));
  };

  const handleDone = () => {
    onUpdateSettings({ selectedCities });
    onGoBack();
  };

  const detectLocation = async () => {
    setDetecting(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(strings.locationError);
        setDetecting(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const cityName = place.city || place.subregion || place.region || '';
        if (cityName && !selectedCities.includes(cityName)) {
          setSelectedCities((prev) => [...prev, cityName]);
        }
      }
    } catch (e) {
      console.error('Location error:', e);
      Alert.alert(strings.locationError);
    } finally {
      setDetecting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <TouchableOpacity onPress={handleDone} style={styles.backBtn}>
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={28}
            color="#ffffff"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{strings.selectAreas}</Text>
        <TouchableOpacity onPress={handleDone} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>{strings.done}</Text>
        </TouchableOpacity>
      </View>

      {/* Stats bar */}
      <View style={[styles.statsBar, isRTL && styles.statsBarRTL]}>
        <Text style={[styles.statsText, isRTL && styles.textRTL]}>
          {selectedCities.length} {strings.selected}
        </Text>
        <TouchableOpacity
          style={[styles.gpsBtn, isRTL && styles.gpsBtnRTL]}
          onPress={detectLocation}
          disabled={detecting}
        >
          <Ionicons
            name="navigate-outline"
            size={16}
            color="#e94560"
          />
          <Text style={styles.gpsBtnText}>
            {detecting ? strings.detectingLocation : strings.detectLocation}
          </Text>
        </TouchableOpacity>
      </View>

      {/* City list */}
      <AreaSearch
        selectedCities={selectedCities}
        onToggleCity={toggleCity}
        onSelectZone={selectZone}
        onDeselectZone={deselectZone}
        language={settings.language}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  doneBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  statsBarRTL: {
    flexDirection: 'row-reverse',
  },
  statsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  gpsBtnRTL: {
    flexDirection: 'row-reverse',
  },
  gpsBtnText: {
    fontSize: 13,
    color: '#e94560',
    fontWeight: '600',
  },
});
