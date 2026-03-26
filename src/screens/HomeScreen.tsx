import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AlertCard from '../components/AlertCard';
import {
  DisplayAlert,
  onAlert,
  onEndAlert,
  onConnectionChange,
  isConnected,
} from '../services/socket';
import { getSettings, AppSettings } from '../stores/settings';
import { playAlert } from '../services/sound';
import { Language, t } from '../i18n';

interface HomeScreenProps {
  settings: AppSettings;
}

export default function HomeScreen({ settings }: HomeScreenProps) {
  const [alerts, setAlerts] = useState<DisplayAlert[]>([]);
  const [connected, setConnected] = useState(isConnected());
  const [refreshing, setRefreshing] = useState(false);
  const strings = t(settings.language);
  const isRTL = settings.language === 'he';

  useEffect(() => {
    const unsubConn = onConnectionChange((c) => setConnected(c));

    const unsubAlert = onAlert((newAlerts) => {
      const currentSettings = getSettings();

      // Filter alerts to only relevant cities
      const relevantAlerts = currentSettings.receiveAll
        ? newAlerts
        : newAlerts.filter((a) =>
            a.cities.some((city) =>
              currentSettings.selectedCities.includes(city)
            )
          );

      if (relevantAlerts.length === 0) return;

      // Pick the right sound based on alert type
      const isPreAlert = relevantAlerts.some((a) => a.type === 'newsFlash');
      const soundKey = isPreAlert
        ? currentSettings.soundPreAlert
        : currentSettings.soundAlert;
      playAlert(soundKey);

      setAlerts((prev) => [...relevantAlerts, ...prev].slice(0, 100));
    });

    const unsubEnd = onEndAlert((endAlert) => {
      const currentSettings = getSettings();
      const isRelevant =
        currentSettings.receiveAll ||
        endAlert.cities.some((city) =>
          currentSettings.selectedCities.includes(city)
        );

      if (!isRelevant) return;

      playAlert(currentSettings.soundEndAlert);
      setAlerts((prev) => [endAlert, ...prev].slice(0, 100));
    });

    return () => {
      unsubConn();
      unsubAlert();
      unsubEnd();
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const monitoringText = settings.receiveAll
    ? strings.monitoringAll
    : settings.selectedCities.length > 0
    ? `${strings.monitoring} ${settings.selectedCities.length} ${strings.cities}`
    : strings.noCitiesSelected;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.headerTop, isRTL && styles.headerTopRTL]}>
          <Text style={styles.appTitle}>RedAlert</Text>
          <Text style={styles.appTitleEmoji}> 🚨</Text>
          <View style={styles.spacer} />
          <View style={[styles.statusBadge, isRTL && styles.statusBadgeRTL]}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: connected ? '#2dc653' : '#ef4444' },
              ]}
            />
            <Text style={styles.statusText}>
              {connected ? strings.connected : strings.disconnected}
            </Text>
          </View>
        </View>
        <Text style={[styles.monitoringText, isRTL && styles.textRTL]}>
          {monitoringText}
        </Text>
      </View>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="shield-checkmark-outline" size={64} color="#2d3748" />
          <Text style={styles.emptyTitle}>{strings.noAlerts}</Text>
          <Text style={[styles.emptyDesc, isRTL && styles.textRTL]}>
            {strings.noAlertsDesc}
          </Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AlertCard alert={item} language={settings.language} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#e94560"
              colors={['#e94560']}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTopRTL: {
    flexDirection: 'row-reverse',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#ffffff',
  },
  appTitleEmoji: {
    fontSize: 24,
  },
  spacer: {
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeRTL: {
    flexDirection: 'row-reverse',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  monitoringText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4b5563',
    marginTop: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 30,
  },
});
