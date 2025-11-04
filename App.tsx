import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  useColorScheme,
  TextInput,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -100;

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

interface ScheduledWorkout {
  id: string;
  name: string;
  time: string;
  duration: number;
  emoji: string;
  completed: boolean;
  dayOfWeek: string;
}

type ThemeMode = 'light' | 'dark' | 'auto';
type TabType = 'today' | 'week' | 'schedule';

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

  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([
    {
      id: 's1',
      name: 'Morning Cardio',
      time: '06:00 AM',
      duration: 30,
      emoji: '🏃',
      completed: true,
      dayOfWeek: 'Monday',
    },
    {
      id: 's2',
      name: 'Strength Training',
      time: '05:00 PM',
      duration: 45,
      emoji: '💪',
      completed: false,
      dayOfWeek: 'Monday',
    },
    {
      id: 's3',
      name: 'Yoga Flow',
      time: '07:00 AM',
      duration: 60,
      emoji: '🧘',
      completed: false,
      dayOfWeek: 'Tuesday',
    },
    {
      id: 's4',
      name: 'HIIT Session',
      time: '06:30 PM',
      duration: 30,
      emoji: '🔥',
      completed: false,
      dayOfWeek: 'Wednesday',
    },
    {
      id: 's5',
      name: 'Swimming',
      time: '08:00 AM',
      duration: 45,
      emoji: '🏊',
      completed: false,
      dayOfWeek: 'Thursday',
    },
  ]);

  const [healthStats, setHealthStats] = useState<HealthStats>({
    steps: 8247,
    distance: 6.2,
    activeMinutes: 135,
    heartRate: 72,
  });

  const [selectedTab, setSelectedTab] = useState<TabType>('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<ScheduledWorkout | null>(null);
  const [newWorkoutName, setNewWorkoutName] = useState('');
  const [newWorkoutTime, setNewWorkoutTime] = useState('');
  const [newWorkoutDuration, setNewWorkoutDuration] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedEmoji, setSelectedEmoji] = useState('🏃');

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const workoutEmojis = ['🏃', '💪', '🧘', '🔥', '🏊', '🚴', '⛹️', '🤸'];

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

  const handleTabSwitch = (tab: TabType) => {
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

  const handleToggleComplete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setScheduledWorkouts(prev =>
      prev.map(workout =>
        workout.id === id ? { ...workout, completed: !workout.completed } : workout
      )
    );
  };

  const handleAddScheduledWorkout = () => {
    if (!newWorkoutName || !newWorkoutTime || !newWorkoutDuration) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newWorkout: ScheduledWorkout = {
      id: 's' + Date.now(),
      name: newWorkoutName,
      time: newWorkoutTime,
      duration: parseInt(newWorkoutDuration),
      emoji: selectedEmoji,
      completed: false,
      dayOfWeek: selectedDay,
    };

    setScheduledWorkouts(prev => [...prev, newWorkout]);
    setShowAddModal(false);
    setNewWorkoutName('');
    setNewWorkoutTime('');
    setNewWorkoutDuration('');
    setSelectedDay('Monday');
    setSelectedEmoji('🏃');
  };

  const handleEditWorkout = (workout: ScheduledWorkout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingWorkout(workout);
    setNewWorkoutName(workout.name);
    setNewWorkoutTime(workout.time);
    setNewWorkoutDuration(workout.duration.toString());
    setSelectedDay(workout.dayOfWeek);
    setSelectedEmoji(workout.emoji);
    setShowEditModal(true);
  };

  const handleUpdateWorkout = () => {
    if (!editingWorkout || !newWorkoutName || !newWorkoutTime || !newWorkoutDuration) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScheduledWorkouts(prev =>
      prev.map(workout =>
        workout.id === editingWorkout.id
          ? {
              ...workout,
              name: newWorkoutName,
              time: newWorkoutTime,
              duration: parseInt(newWorkoutDuration),
              emoji: selectedEmoji,
              dayOfWeek: selectedDay,
            }
          : workout
      )
    );

    setShowEditModal(false);
    setEditingWorkout(null);
    setNewWorkoutName('');
    setNewWorkoutTime('');
    setNewWorkoutDuration('');
    setSelectedDay('Monday');
    setSelectedEmoji('🏃');
  };

  const handleDeleteScheduledWorkout = (id: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setScheduledWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const colors = {
    background: isDark ? '#000000' : '#F5F7FA',
    cardBg: isDark ? '#1C1C1E' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#1C1C1E',
    textSecondary: isDark ? '#8E8E93' : '#8E8E93',
    border: isDark ? '#2C2C2E' : '#E5E5EA',
    statBg: isDark ? '#2C2C2E' : '#F9FAFB',
    emojiCircle: isDark ? '#2C2C2E' : '#F2F2F7',
    modalBg: isDark ? '#1C1C1E' : '#FFFFFF',
    inputBg: isDark ? '#2C2C2E' : '#F2F2F7',
    deleteBg: '#FF3B30',
  };

  const SwipeableWorkoutCard = ({ workout }: { workout: ScheduledWorkout }) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const [isDeleting, setIsDeleting] = useState(false);

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return Math.abs(gestureState.dx) > 10;
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, -120));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < SWIPE_THRESHOLD) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            setIsDeleting(true);
            Animated.timing(translateX, {
              toValue: -SCREEN_WIDTH,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              handleDeleteScheduledWorkout(workout.id);
            });
          } else {
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }).start();
          }
        },
      })
    ).current;

    return (
      <View style={styles.swipeableContainer}>
        <View style={[styles.deleteBackground, { backgroundColor: colors.deleteBg }]}>
          <Ionicons name="trash" size={24} color="#FFFFFF" />
          <Text style={styles.deleteText}>Delete</Text>
        </View>

        <Animated.View
          style={[
            styles.swipeableCard,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={[styles.scheduledWorkoutCard, { backgroundColor: colors.cardBg }]}
            onPress={() => handleToggleComplete(workout.id)}
            activeOpacity={0.7}
          >
            <TouchableOpacity
              style={[
                styles.checkCircle,
                { borderColor: colors.border },
                workout.completed && styles.checkCircleCompleted,
              ]}
              onPress={() => handleToggleComplete(workout.id)}
            >
              {workout.completed && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </TouchableOpacity>

            <View style={[styles.scheduledWorkoutEmoji, { backgroundColor: colors.emojiCircle }]}>
              <Text style={styles.scheduledEmoji}>{workout.emoji}</Text>
            </View>

            <View style={styles.scheduledWorkoutInfo}>
              <Text
                style={[
                  styles.scheduledWorkoutName,
                  { color: colors.text },
                  workout.completed && styles.completedText,
                ]}
              >
                {workout.name}
              </Text>
              <View style={styles.scheduledWorkoutMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{workout.time}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="hourglass-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{workout.duration} min</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditWorkout(workout)}
            >
              <Ionicons name="create-outline" size={22} color="#667EEA" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  const renderScheduleContent = () => {
    const groupedWorkouts = weekDays.map(day => ({
      day,
      workouts: scheduledWorkouts.filter(w => w.dayOfWeek === day),
    }));

    return (
      <View>
        <View style={styles.scheduleHeader}>
          <Text style={[styles.scheduleTitle, { color: colors.text }]}>Weekly Schedule</Text>
          <TouchableOpacity
            style={styles.addScheduleButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowAddModal(true);
            }}
          >
            <Ionicons name="add-circle" size={28} color="#667EEA" />
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBg }]}>
          <Ionicons name="information-circle" size={20} color="#667EEA" />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Tap to complete • Tap edit icon to modify • Swipe left to delete
          </Text>
        </View>

        {groupedWorkouts.map(({ day, workouts: dayWorkouts }) => (
          <View key={day} style={styles.daySection}>
            <View style={styles.daySectionHeader}>
              <Text style={[styles.dayTitle, { color: colors.text }]}>{day}</Text>
              <Text style={styles.dayCount}>{dayWorkouts.length} workout{dayWorkouts.length !== 1 ? 's' : ''}</Text>
            </View>

            {dayWorkouts.length === 0 ? (
              <View style={[styles.emptyDay, { backgroundColor: colors.statBg }]}>
                <Ionicons name="calendar-outline" size={32} color={colors.textSecondary} />
                <Text style={[styles.emptyDayText, { color: colors.textSecondary }]}>No workouts scheduled</Text>
              </View>
            ) : (
              dayWorkouts.map(workout => (
                <SwipeableWorkoutCard key={workout.id} workout={workout} />
              ))
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderTodayContent = () => (
    <View>
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
    </View>
  );

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollContainer}>
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
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'schedule' && styles.tabActive,
              ]}
              onPress={() => handleTabSwitch('schedule')}
            >
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'schedule' && styles.tabTextActive,
                ]}
              >
                Schedule
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'today' && renderTodayContent()}
        {selectedTab === 'week' && renderTodayContent()}
        {selectedTab === 'schedule' && renderScheduleContent()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Data synced with Apple HealthKit
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            Theme: {themeMode === 'auto' ? `Auto (${isDark ? 'Dark' : 'Light'})` : themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Schedule Workout</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Workout Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="e.g., Morning Run"
                placeholderTextColor={colors.textSecondary}
                value={newWorkoutName}
                onChangeText={setNewWorkoutName}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="e.g., 06:00 AM"
                placeholderTextColor={colors.textSecondary}
                value={newWorkoutTime}
                onChangeText={setNewWorkoutTime}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="e.g., 30"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={newWorkoutDuration}
                onChangeText={setNewWorkoutDuration}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Day of Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
                {weekDays.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayOption,
                      { backgroundColor: colors.inputBg },
                      selectedDay === day && styles.dayOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedDay(day);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        { color: colors.text },
                        selectedDay === day && styles.dayOptionTextSelected,
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiPicker}>
                {workoutEmojis.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      { backgroundColor: colors.inputBg },
                      selectedEmoji === emoji && styles.emojiOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedEmoji(emoji);
                    }}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddScheduledWorkout}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['#4A148C', '#6A1B9A'] : ['#667EEA', '#764BA2']}
                  style={styles.modalAddButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.modalAddButtonText}>Add to Schedule</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Workout</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Workout Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="e.g., Morning Run"
                placeholderTextColor={colors.textSecondary}
                value={newWorkoutName}
                onChangeText={setNewWorkoutName}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="e.g., 06:00 AM"
                placeholderTextColor={colors.textSecondary}
                value={newWorkoutTime}
                onChangeText={setNewWorkoutTime}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Duration (minutes)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
                placeholder="e.g., 30"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
                value={newWorkoutDuration}
                onChangeText={setNewWorkoutDuration}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Day of Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
                {weekDays.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayOption,
                      { backgroundColor: colors.inputBg },
                      selectedDay === day && styles.dayOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedDay(day);
                    }}
                  >
                    <Text
                      style={[
                        styles.dayOptionText,
                        { color: colors.text },
                        selectedDay === day && styles.dayOptionTextSelected,
                      ]}
                    >
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emojiPicker}>
                {workoutEmojis.map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      { backgroundColor: colors.inputBg },
                      selectedEmoji === emoji && styles.emojiOptionSelected,
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedEmoji(emoji);
                    }}
                  >
                    <Text style={styles.emojiOptionText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleUpdateWorkout}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={isDark ? ['#4A148C', '#6A1B9A'] : ['#667EEA', '#764BA2']}
                  style={styles.modalAddButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                  <Text style={styles.modalAddButtonText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  tabScrollContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 26,
    fontWeight: '800',
  },
  addScheduleButton: {
    padding: 4,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  daySection: {
    marginBottom: 28,
  },
  daySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  dayCount: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  emptyDay: {
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDayText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  swipeableContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  swipeableCard: {
    width: '100%',
  },
  scheduledWorkoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkCircleCompleted: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  scheduledWorkoutEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scheduledEmoji: {
    fontSize: 24,
  },
  scheduledWorkoutInfo: {
    flex: 1,
  },
  scheduledWorkoutName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  scheduledWorkoutMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  editButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  dayPicker: {
    marginBottom: 8,
  },
  dayOption: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 8,
  },
  dayOptionSelected: {
    backgroundColor: '#667EEA',
  },
  dayOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayOptionTextSelected: {
    color: '#FFFFFF',
  },
  emojiPicker: {
    marginBottom: 8,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiOptionSelected: {
    backgroundColor: '#667EEA',
  },
  emojiOptionText: {
    fontSize: 28,
  },
  modalAddButton: {
    marginTop: 24,
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalAddButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  modalAddButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});