import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

interface Workout {
  id: string;
  name: string;
  duration: number;
  calories: number;
  emoji: string;
  timestamp: Date;
  heartRate?: number;
}

interface HealthStats {
  steps: number;
  distance: number;
  activeMinutes: number;
  heartRate: number;
}

type ThemeMode = 'light' | 'dark' | 'auto';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('auto');
  
  const isDark = themeMode === 'auto' 
    ? systemColorScheme === 'dark' 
    : themeMode === 'dark';

  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: '1',
      name: 'Morning Run',
      duration: 30,
      calories: 250,
      emoji: '🏃',
      timestamp: new Date(),
      heartRate: 145,
    },
    {
      id: '2',
      name: 'Yoga Session',
      duration: 45,
      calories: 150,
      emoji: '🧘',
      timestamp: new Date(),
      heartRate: 98,
    },
    {
      id: '3',
      name: 'Weight Training',
      duration: 60,
      calories: 400,
      emoji: '💪',
      timestamp: new Date(),
      heartRate: 132,
    },
  ]);

  const [healthStats, setHealthStats] = useState<HealthStats>({
    steps: 8247,
    distance: 6.2,
    activeMinutes: 135,
    heartRate: 72,
  });

  const [selectedTab, setSelectedTab] = useState<'today' | 'week'>('today');

  useEffect(() => {
    const interval = setInterval(() => {
      setHealthStats(prev => ({
        ...prev,
        steps: prev.steps + Math.floor(Math.random() * 10),
        heartRate: 68 + Math.floor(Math.random() * 12),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalCalories = workouts.reduce((sum, w) => sum + w.calories, 0);
  const totalMinutes = workouts.reduce((sum, w) => sum + w.duration, 0);
  const avgHeartRate = Math.round(
    workouts.reduce((sum, w) => sum + (w.heartRate || 0), 0) / workouts.length
  );

  const handleAddWorkout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Log New Workout',
      'This feature connects to HealthKit to automatically log your workouts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Connect HealthKit',
          onPress: () => {
            Alert.alert('Success', 'HealthKit integration ready!');
          },
        },
      ]
    );
  };

  const handleWorkoutPress = (workout: Workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      workout.name,
      `Duration: ${workout.duration} min\nCalories: ${workout.calories}\nHeart Rate: ${workout.heartRate} bpm`,
      [{ text: 'OK' }]
    );
  };

  const handleTabSwitch = (tab: 'today' | 'week') => {
    Haptics.selectionAsync();
    setSelectedTab(tab);
  };

  const handleThemeToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const modes: ThemeMode[] = ['light', 'dark', 'auto'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const getThemeIcon = () => {
    if (themeMode === 'light') return 'sunny';
    if (themeMode === 'dark') return 'moon';
    return 'phone-portrait';
  };

  const colors = {
    background: isDark ? '#000000' : '#F5F7FA',
    cardBg: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    textSecondary: isDark ? '#8E8E93' : '#8E8E93',
    border: isDark ? '#2C2C2E' : '#E5E5EA',
    statBg: isDark ? '#2C2C2E' : '#F9FAFB',
    emojiCircle: isDark ? '#2C2C2E' : '#F2F2F7',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <LinearGradient colors={isDark ? ['#4A148C', '#6A1B9A'] : ['#667EEA', '#764BA2']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Fitness Tracker</Text>
            <Text style={styles.headerSubtitle}>Powered by HealthKit 💚</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.themeButton} onPress={handleThemeToggle}>
              <Ionicons name={getThemeIcon()} size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.syncButton}>
              <Ionicons name="sync" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'today' && styles.tabActive,
            ]}
            onPress={() => handleTabSwitch('today')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'today' && styles.tabTextActive,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'week' && styles.tabActive,
            ]}
            onPress={() => handleTabSwitch('week')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'week' && styles.tabTextActive,
              ]}
            >
              This Week
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.healthKitCard, { backgroundColor: colors.cardBg }]}>
          <View style={styles.healthKitHeader}>
            <Ionicons name="heart" size={24} color="#FF2D55" />
            <Text style={[styles.healthKitTitle, { color: colors.text }]}>HealthKit Stats</Text>
          </View>

          <View style={styles.healthStatsGrid}>
            <View style={[styles.healthStat, { backgroundColor: colors.statBg }]}>
              <View style={[styles.healthStatIcon, { backgroundColor: colors.cardBg }]}>
                <Ionicons name="footsteps" size={20} color="#5856D6" />
              </View>
              <Text style={[styles.healthStatValue, { color: colors.text }]}>
                {healthStats.steps.toLocaleString()}
              </Text>
              <Text style={styles.healthStatLabel}>Steps</Text>
            </View>

            <View style={[styles.healthStat, { backgroundColor: colors.statBg }]}>
              <View style={[styles.healthStatIcon, { backgroundColor: colors.cardBg }]}>
                <Ionicons name="navigate" size={20} color="#34C759" />
              </View>
              <Text style={[styles.healthStatValue, { color: colors.text }]}>
                {healthStats.distance.toFixed(1)} km
              </Text>
              <Text style={styles.healthStatLabel}>Distance</Text>
            </View>

            <View style={[styles.healthStat, { backgroundColor: colors.statBg }]}>
              <View style={[styles.healthStatIcon, { backgroundColor: colors.cardBg }]}>
                <Ionicons name="pulse" size={20} color="#FF3B30" />
              </View>
              <Text style={[styles.healthStatValue, { color: colors.text }]}>{healthStats.heartRate}</Text>
              <Text style={styles.healthStatLabel}>Heart Rate</Text>
            </View>

            <View style={[styles.healthStat, { backgroundColor: colors.statBg }]}>
              <View style={[styles.healthStatIcon, { backgroundColor: colors.cardBg }]}>
                <Ionicons name="flame" size={20} color="#FF9500" />
              </View>
              <Text style={[styles.healthStatValue, { color: colors.text }]}>
                {healthStats.activeMinutes}
              </Text>
              <Text style={styles.healthStatLabel}>Active Min</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.statGradient}
            >
              <Ionicons name="flame" size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{totalCalories}</Text>
              <Text style={styles.statLabel}>Calories Burned</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              style={styles.statGradient}
            >
              <Ionicons name="time" size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>Active Minutes</Text>
            </LinearGradient>
          </View>

          <View style={styles.statCard}>
            <LinearGradient
              colors={['#A8EDEA', '#6DD5ED']}
              style={styles.statGradient}
            >
              <Ionicons name="heart" size={28} color="#FFFFFF" />
              <Text style={styles.statValue}>{avgHeartRate}</Text>
              <Text style={styles.statLabel}>Avg Heart Rate</Text>
            </LinearGradient>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Workouts</Text>
          <Text style={styles.workoutCount}>{workouts.length} logged</Text>
        </View>

        {workouts.map(workout => (
          <TouchableOpacity
            key={workout.id}
            style={[styles.workoutCard, { backgroundColor: colors.cardBg }]}
            onPress={() => handleWorkoutPress(workout)}
            activeOpacity={0.7}
          >
            <View style={[styles.workoutEmoji, { backgroundColor: colors.emojiCircle }]}>
              <Text style={styles.emoji}>{workout.emoji}</Text>
            </View>

            <View style={styles.workoutInfo}>
              <Text style={[styles.workoutName, { color: colors.text }]}>{workout.name}</Text>
              <View style={styles.workoutStats}>
                <View style={styles.workoutStat}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.workoutStatText, { color: colors.textSecondary }]}>
                    {workout.duration} min
                  </Text>
                </View>
                <View style={styles.workoutStat}>
                  <Ionicons name="flame-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.workoutStatText, { color: colors.textSecondary }]}>
                    {workout.calories} cal
                  </Text>
                </View>
                {workout.heartRate && (
                  <View style={styles.workoutStat}>
                    <Ionicons name="heart-outline" size={14} color={colors.textSecondary} />
                    <Text style={[styles.workoutStatText, { color: colors.textSecondary }]}>
                      {workout.heartRate} bpm
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.completeBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddWorkout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={isDark ? ['#4A148C', '#6A1B9A'] : ['#667EEA', '#764BA2']}
            style={styles.addButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Log New Workout</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data synced with Apple HealthKit
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            Theme: {themeMode === 'auto' ? `Auto (${isDark ? 'Dark' : 'Light'})` : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '500',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  tabTextActive: {
    color: '#667EEA',
    opacity: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  healthKitCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  healthKitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  healthKitTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  healthStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthStat: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  healthStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  healthStatLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  workoutCount: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  workoutEmoji: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 32,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutStatText: {
    fontSize: 13,
    fontWeight: '500',
  },
  completeBadge: {
    marginLeft: 8,
  },
  addButton: {
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});