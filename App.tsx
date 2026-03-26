import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, I18nManager, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AreaPickerScreen from './src/screens/AreaPickerScreen';
import {
  AppSettings,
  loadSettings,
  updateSettings,
} from './src/stores/settings';
import { connectSocket } from './src/services/socket';
import { t } from './src/i18n';

const Tab = createBottomTabNavigator();

const DarkTheme = {
  dark: true,
  colors: {
    primary: '#e94560',
    background: '#1a1a2e',
    card: '#16213e',
    text: '#ffffff',
    border: 'rgba(255,255,255,0.08)',
    notification: '#e94560',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export default function App() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showAreaPicker, setShowAreaPicker] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await loadSettings();
      setSettings(loaded);
      connectSocket();
    })();
  }, []);

  const handleUpdateSettings = useCallback(
    async (partial: Partial<AppSettings>) => {
      const updated = await updateSettings(partial);
      setSettings({ ...updated });

      // Handle RTL changes
      if (partial.language !== undefined) {
        const shouldBeRTL = partial.language === 'he';
        if (I18nManager.isRTL !== shouldBeRTL) {
          I18nManager.allowRTL(shouldBeRTL);
          I18nManager.forceRTL(shouldBeRTL);
        }
      }
    },
    []
  );

  if (!settings) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
      </View>
    );
  }

  if (showAreaPicker) {
    return (
      <SafeAreaProvider>
        <View style={styles.fullScreen}>
          <StatusBar style="light" />
          <View style={{ height: Platform.OS === 'ios' ? 50 : 30 }} />
          <AreaPickerScreen
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onGoBack={() => setShowAreaPicker(false)}
          />
        </View>
      </SafeAreaProvider>
    );
  }

  const strings = t(settings.language);

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={DarkTheme}>
        <StatusBar style="light" />
        <Tab.Navigator
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#16213e',
              borderTopColor: 'rgba(255,255,255,0.06)',
              height: Platform.OS === 'ios' ? 88 : 64,
              paddingBottom: Platform.OS === 'ios' ? 28 : 8,
              paddingTop: 8,
            },
            tabBarActiveTintColor: '#e94560',
            tabBarInactiveTintColor: '#6b7280',
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            headerStyle: {
              backgroundColor: '#16213e',
              shadowColor: 'transparent',
              elevation: 0,
            },
            headerTintColor: '#ffffff',
            headerTitleStyle: {
              fontWeight: '700',
            },
          }}
        >
          <Tab.Screen
            name="Home"
            options={{
              title: strings.home,
              headerShown: false,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="home" size={size} color={color} />
              ),
            }}
          >
            {() => <HomeScreen settings={settings} />}
          </Tab.Screen>
          <Tab.Screen
            name="Settings"
            options={{
              title: strings.settings,
              headerTitle: strings.settings,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="settings" size={size} color={color} />
              ),
            }}
          >
            {() => (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                onNavigateToAreaPicker={() => setShowAreaPicker(true)}
              />
            )}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
});
