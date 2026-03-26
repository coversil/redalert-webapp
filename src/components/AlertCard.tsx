import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  I18nManager,
} from 'react-native';
import { getAlertTypeInfo } from '../constants/alertTypes';
import { Language } from '../i18n';

interface AlertCardProps {
  alert: {
    id: string;
    type: string;
    title: string;
    cities: string[];
    instructions: string;
    timestamp: number;
    isEnd: boolean;
  };
  language: Language;
}

function formatTimeAgo(timestamp: number, lang: Language): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return lang === 'he' ? `${diff} שניות` : `${diff}s ago`;
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return lang === 'he' ? `${m} דקות` : `${m}m ago`;
  }
  const h = Math.floor(diff / 3600);
  return lang === 'he' ? `${h} שעות` : `${h}h ago`;
}

export default function AlertCard({ alert, language }: AlertCardProps) {
  const typeInfo = getAlertTypeInfo(alert.type);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [timeAgo, setTimeAgo] = useState(formatTimeAgo(alert.timestamp, language));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(alert.timestamp, language));
    }, 10000);
    return () => clearInterval(interval);
  }, [alert.timestamp, language]);

  const isRTL = language === 'he';
  const isEnd = alert.isEnd || alert.type === 'endAlert';
  const bgColor = isEnd ? '#0d3320' : '#3b1020';
  const borderColor = isEnd ? '#2dc653' : typeInfo.color;
  const displayTitle = language === 'he' ? typeInfo.he : typeInfo.en;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderLeftColor: borderColor,
          borderLeftWidth: 4,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Text style={styles.emoji}>{typeInfo.emoji}</Text>
        <View style={styles.headerText}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Text
              style={[styles.title, isRTL && styles.textRTL]}
              numberOfLines={1}
            >
              {displayTitle}
            </Text>
            {typeInfo.isDrill && (
              <View style={styles.drillBadge}>
                <Text style={styles.drillText}>
                  {language === 'he' ? 'תרגיל' : 'DRILL'}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.time, isRTL && styles.textRTL]}>{timeAgo}</Text>
        </View>
      </View>

      {alert.cities.length > 0 && (
        <View style={styles.citiesContainer}>
          <View style={[styles.citiesWrap, isRTL && styles.citiesWrapRTL]}>
            {alert.cities.map((city, i) => (
              <View key={`${city}-${i}`} style={styles.cityChip}>
                <Text style={styles.cityText}>{city}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {alert.instructions ? (
        <View style={styles.instructionsContainer}>
          <Text style={[styles.instructionsLabel, isRTL && styles.textRTL]}>
            {language === 'he' ? 'הנחיות' : 'Instructions'}
          </Text>
          <Text style={[styles.instructions, isRTL && styles.textRTL]}>
            {alert.instructions}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  emoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    flexShrink: 1,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  time: {
    fontSize: 13,
    color: '#8b95a5',
    marginTop: 2,
  },
  drillBadge: {
    backgroundColor: '#f4845f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  drillText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  citiesContainer: {
    marginTop: 12,
  },
  citiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  citiesWrapRTL: {
    flexDirection: 'row-reverse',
  },
  cityChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cityText: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '500',
  },
  instructionsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  instructionsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8b95a5',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructions: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 20,
  },
});
