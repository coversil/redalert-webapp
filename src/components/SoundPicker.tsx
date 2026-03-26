import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SOUNDS } from '../services/sound';
import { previewSound } from '../services/sound';
import { Language } from '../i18n';

interface SoundPickerProps {
  selectedSound: string;
  onSelect: (key: string) => void;
  language: Language;
  title?: string;
  description?: string;
  accentColor?: string;
}

export default function SoundPicker({
  selectedSound,
  onSelect,
  language,
  title,
  description,
  accentColor = '#e94560',
}: SoundPickerProps) {
  const isRTL = language === 'he';

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
          {description && (
            <Text style={[styles.description, isRTL && styles.textRTL]}>
              {description}
            </Text>
          )}
        </View>
      )}
      {SOUNDS.map((sound) => {
        const isSelected = selectedSound === sound.key;
        const name = isRTL ? sound.nameHe : sound.nameEn;

        return (
          <TouchableOpacity
            key={sound.key}
            style={[
              styles.row,
              isSelected && { backgroundColor: `${accentColor}15` },
              isRTL && styles.rowRTL,
            ]}
            onPress={() => onSelect(sound.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.radioOuter,
                isSelected && { borderColor: accentColor },
              ]}
            >
              {isSelected && (
                <View
                  style={[styles.radioInner, { backgroundColor: accentColor }]}
                />
              )}
            </View>

            <Text style={[styles.soundEmoji]}>{sound.description}</Text>

            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
                isRTL && styles.textRTL,
              ]}
            >
              {name}
            </Text>

            <TouchableOpacity
              style={styles.previewBtn}
              onPress={() => previewSound(sound.key)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="volume-medium-outline"
                size={20}
                color={isSelected ? accentColor : '#6b7280'}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  description: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 10,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4b5563',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  soundEmoji: {
    fontSize: 18,
    width: 26,
    textAlign: 'center',
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: '#d1d5db',
  },
  labelSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  previewBtn: {
    padding: 6,
  },
});
