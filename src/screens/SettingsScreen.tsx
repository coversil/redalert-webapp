import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SoundPicker from '../components/SoundPicker';
import { AppSettings } from '../stores/settings';
import { Language, t } from '../i18n';

interface SettingsScreenProps {
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onNavigateToAreaPicker: () => void;
}

export default function SettingsScreen({
  settings,
  onUpdateSettings,
  onNavigateToAreaPicker,
}: SettingsScreenProps) {
  const strings = t(settings.language);
  const isRTL = settings.language === 'he';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Language Toggle */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          {strings.language}
        </Text>
        <View style={styles.langToggleContainer}>
          <TouchableOpacity
            style={[
              styles.langBtn,
              settings.language === 'he' && styles.langBtnActive,
            ]}
            onPress={() => onUpdateSettings({ language: 'he' })}
          >
            <Text
              style={[
                styles.langBtnText,
                settings.language === 'he' && styles.langBtnTextActive,
              ]}
            >
              עברית
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.langBtn,
              settings.language === 'en' && styles.langBtnActive,
            ]}
            onPress={() => onUpdateSettings({ language: 'en' })}
          >
            <Text
              style={[
                styles.langBtnText,
                settings.language === 'en' && styles.langBtnTextActive,
              ]}
            >
              English
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pre-Alert Sound (newsFlash) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          📢 {strings.preAlertSound}
        </Text>
        <View style={styles.card}>
          <SoundPicker
            selectedSound={settings.soundPreAlert}
            onSelect={(key) => onUpdateSettings({ soundPreAlert: key })}
            language={settings.language}
            description={strings.preAlertDesc}
            accentColor="#f59e0b"
          />
        </View>
      </View>

      {/* Main Alert Sound (missiles, earthquake etc) */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          🚨 {strings.mainAlertSound}
        </Text>
        <View style={styles.card}>
          <SoundPicker
            selectedSound={settings.soundAlert}
            onSelect={(key) => onUpdateSettings({ soundAlert: key })}
            language={settings.language}
            description={strings.mainAlertDesc}
            accentColor="#e94560"
          />
        </View>
      </View>

      {/* End Alert Sound */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
          ✅ {strings.endAlertSound}
        </Text>
        <View style={styles.card}>
          <SoundPicker
            selectedSound={settings.soundEndAlert}
            onSelect={(key) => onUpdateSettings({ soundEndAlert: key })}
            language={settings.language}
            description={strings.endAlertDesc}
            accentColor="#10b981"
          />
        </View>
      </View>

      {/* Receive All Toggle */}
      <View style={styles.section}>
        <View style={[styles.toggleRow, isRTL && styles.toggleRowRTL]}>
          <View style={[styles.toggleInfo, isRTL && { alignItems: 'flex-end' }]}>
            <Text style={[styles.toggleLabel, isRTL && styles.textRTL]}>
              {strings.receiveAll}
            </Text>
            <Text style={[styles.toggleDesc, isRTL && styles.textRTL]}>
              {strings.receiveAllDesc}
            </Text>
          </View>
          <Switch
            value={settings.receiveAll}
            onValueChange={(val) => onUpdateSettings({ receiveAll: val })}
            trackColor={{ false: '#374151', true: '#e94560' }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      {/* Select Areas */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.areaButton, isRTL && styles.areaButtonRTL]}
          onPress={onNavigateToAreaPicker}
          activeOpacity={0.7}
        >
          <View style={[styles.areaButtonLeft, isRTL && styles.areaButtonLeftRTL]}>
            <Ionicons name="location-outline" size={22} color="#e94560" />
            <View>
              <Text style={[styles.areaButtonText, isRTL && styles.textRTL]}>
                {strings.selectAreas}
              </Text>
              <Text style={[styles.areaButtonSub, isRTL && styles.textRTL]}>
                {settings.selectedCities.length > 0
                  ? `${settings.selectedCities.length} ${strings.selectedCities}`
                  : strings.noCitiesSelected}
              </Text>
            </View>
          </View>
          <Ionicons
            name={isRTL ? 'chevron-back' : 'chevron-forward'}
            size={20}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>

      {/* Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>{strings.version} 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  langToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 4,
  },
  langBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  langBtnActive: {
    backgroundColor: '#e94560',
  },
  langBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  langBtnTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  toggleRowRTL: {
    flexDirection: 'row-reverse',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  toggleDesc: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
  },
  areaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  areaButtonRTL: {
    flexDirection: 'row-reverse',
  },
  areaButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  areaButtonLeftRTL: {
    flexDirection: 'row-reverse',
  },
  areaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  areaButtonSub: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#4b5563',
  },
});
