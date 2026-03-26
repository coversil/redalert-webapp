import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Language, t } from '../i18n';

const API_URL = 'https://redalert.orielhaim.com';
const API_KEY =
  'pr_lWIlcPmNGSpucLeynXRRzgQqJaYyJQDsAreQdydMrHaRjBdhkTvoHbyzkXRAJvEQ';

export interface CityData {
  id: string;
  name: string;
  zone: string;
  countdown: number;
}

interface ZoneGroup {
  zone: string;
  cities: CityData[];
}

interface AreaSearchProps {
  selectedCities: string[];
  onToggleCity: (cityName: string) => void;
  onSelectZone: (zone: string, cities: CityData[]) => void;
  onDeselectZone: (zone: string, cities: CityData[]) => void;
  language: Language;
}

export default function AreaSearch({
  selectedCities,
  onToggleCity,
  onSelectZone,
  onDeselectZone,
  language,
}: AreaSearchProps) {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const strings = t(language);
  const isRTL = language === 'he';

  const fetchCities = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        let allCities: CityData[] = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const params = new URLSearchParams({
            limit: '500',
            offset: String(offset),
            include: 'countdown',
          });
          if (search.trim()) {
            params.set('search', search.trim());
          }

          const resp = await fetch(`${API_URL}/api/data/cities?${params}`, {
            headers: { Authorization: `Bearer ${API_KEY}` },
          });
          const json = await resp.json();
          allCities = [...allCities, ...json.data];
          hasMore = json.pagination.hasMore;
          offset += 500;
        }

        setCities(allCities);
      } catch (e) {
        console.error('Failed to fetch cities:', e);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCities('');
  }, [fetchCities]);

  useEffect(() => {
    if (initialLoad) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchCities(query);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const grouped: ZoneGroup[] = React.useMemo(() => {
    const map = new Map<string, CityData[]>();
    for (const city of cities) {
      const zone = city.zone || 'Other';
      if (!map.has(zone)) map.set(zone, []);
      map.get(zone)!.push(city);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([zone, zoneCities]) => ({ zone, cities: zoneCities }));
  }, [cities]);

  const isZoneFullySelected = (zoneCities: CityData[]) =>
    zoneCities.every((c) => selectedCities.includes(c.name));

  const renderZone = ({ item }: { item: ZoneGroup }) => {
    const allSelected = isZoneFullySelected(item.cities);

    return (
      <View style={styles.zoneContainer}>
        <View style={[styles.zoneHeader, isRTL && styles.zoneHeaderRTL]}>
          <Text style={[styles.zoneName, isRTL && styles.textRTL]}>
            {item.zone}
          </Text>
          <TouchableOpacity
            onPress={() =>
              allSelected
                ? onDeselectZone(item.zone, item.cities)
                : onSelectZone(item.zone, item.cities)
            }
          >
            <Text style={styles.selectAllText}>
              {allSelected
                ? strings.deselectAllInZone
                : strings.selectAllInZone}
            </Text>
          </TouchableOpacity>
        </View>

        {item.cities.map((city) => {
          const isSelected = selectedCities.includes(city.name);
          return (
            <TouchableOpacity
              key={city.id}
              style={[
                styles.cityRow,
                isSelected && styles.cityRowSelected,
                isRTL && styles.cityRowRTL,
              ]}
              onPress={() => onToggleCity(city.name)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSelected ? '#e94560' : '#6b7280'}
              />
              <Text
                style={[
                  styles.cityName,
                  isSelected && styles.cityNameSelected,
                  isRTL && styles.textRTL,
                ]}
              >
                {city.name}
              </Text>
              <Text style={styles.countdown}>
                {city.countdown}{strings.countdownSec}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isRTL && styles.searchContainerRTL]}>
        <Ionicons name="search-outline" size={20} color="#6b7280" />
        <TextInput
          style={[styles.searchInput, isRTL && styles.searchInputRTL]}
          placeholder={strings.searchCity}
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {loading && cities.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>{strings.loadingCities}</Text>
        </View>
      ) : grouped.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="location-outline" size={48} color="#4b5563" />
          <Text style={styles.loadingText}>{strings.noResults}</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.zone}
          renderItem={renderZone}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginVertical: 12,
    height: 48,
    gap: 10,
  },
  searchContainerRTL: {
    flexDirection: 'row-reverse',
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    height: 48,
  },
  searchInputRTL: {
    writingDirection: 'rtl',
  },
  listContent: {
    paddingBottom: 100,
  },
  zoneContainer: {
    marginBottom: 8,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: 'rgba(15, 52, 96, 0.4)',
  },
  zoneHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  zoneName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#93a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectAllText: {
    fontSize: 13,
    color: '#e94560',
    fontWeight: '600',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  cityRowRTL: {
    flexDirection: 'row-reverse',
  },
  cityRowSelected: {
    backgroundColor: 'rgba(233, 69, 96, 0.06)',
  },
  cityName: {
    flex: 1,
    fontSize: 15,
    color: '#d1d5db',
  },
  cityNameSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  countdown: {
    fontSize: 13,
    color: '#6b7280',
    fontVariant: ['tabular-nums'],
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  loadingText: {
    color: '#6b7280',
    fontSize: 15,
  },
});
