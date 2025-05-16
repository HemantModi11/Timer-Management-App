import React, { useState, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  ScrollView,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { groupTimersByCategory } from '../utils/groupTimersByCategory';
import { ThemeContext, lightTheme  } from '../context/ThemeContext';
import { ThemedButton, TimerProgress } from '../components/UIComponents';
import { Ionicons } from '@expo/vector-icons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const HomeScreen = ({ navigation }) => {
  const { theme = lightTheme, toggleTheme = () => {}, isDark = false } =
  useContext(ThemeContext) || {};
  const [timers, setTimers] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTimers, setActiveTimers] = useState({});

  useFocusEffect(
    useCallback(() => {
      const fetchTimers = async () => {
        const json = await AsyncStorage.getItem('@timers');
        const storedTimers = json ? JSON.parse(json) : [];
        setTimers(storedTimers);
        
        if (storedTimers.length > 0) {
          const categories = [...new Set(storedTimers.map(t => t.category))];
          if (categories.length <= 3) {
            const expanded = {};
            categories.forEach(cat => {
              expanded[cat] = true;
            });
            setExpandedCategories(expanded);
          }
        }
      };
      fetchTimers();
    }, [])
  );

  const addToHistory = async (timerName) => {
    try {
      const storedHistory = await AsyncStorage.getItem('@timer_history');
      const history = storedHistory ? JSON.parse(storedHistory) : [];
      history.unshift({ name: timerName, completedAt: Date.now() });
      await AsyncStorage.setItem('@timer_history', JSON.stringify(history));
    } catch (e) {
      console.log('Failed to save history', e);
    }
  };

  const startTimer = (timerId) => {
    setActiveTimers((prev) => {
      if (prev[timerId]) return prev;
  
      const interval = setInterval(() => {
        setTimers((prevTimers) => {
          const updated = prevTimers.map((t) => {
            if (t.id === timerId) {
              let updatedTimer = { ...t };
  
              if (t.status === 'Running' && t.remaining > 0) {
                updatedTimer.remaining = t.remaining - 1;
  
                if (
                  updatedTimer.remaining === Math.floor(t.duration / 2) &&
                  !updatedTimer.halfwayTriggered &&
                  updatedTimer.halfwayAlert
                ) {
                  Alert.alert('⏳ Halfway There!', `${t.name} is 50% complete.`);
                  updatedTimer.halfwayTriggered = true;
                }
  
                if (updatedTimer.remaining === 0) {
                  updatedTimer.status = 'Completed';
                  clearInterval(interval);
                  setActiveTimers((p) => {
                    const newTimers = { ...p };
                    delete newTimers[timerId];
                    return newTimers;
                  });
                  showCompletionModal(updatedTimer.name);
                  addToHistory(updatedTimer.name);
                }
              }
  
              return updatedTimer;
            }
            return t;
          });
  
          AsyncStorage.setItem('@timers', JSON.stringify(updated));
          return updated;
        });
      }, 1000);
  
      return { ...prev, [timerId]: interval };
    });
  
    setTimers((prev) =>
      prev.map((t) => (t.id === timerId ? { ...t, status: 'Running' } : t))
    );
  };
   
  const pauseTimer = (timerId) => {
    if (activeTimers[timerId]) {
      clearInterval(activeTimers[timerId]);
      setActiveTimers((prev) => {
        const newTimers = { ...prev };
        delete newTimers[timerId];
        return newTimers;
      });
  
      setTimers((prev) =>
        prev.map((t) => (t.id === timerId ? { ...t, status: 'Paused' } : t))
      );
    }
  };
  
  const resetTimer = (timerId) => {
    if (activeTimers[timerId]) {
      clearInterval(activeTimers[timerId]);
    }
    setActiveTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[timerId];
      return newTimers;
    });
  
    setTimers((prev) => {
      const updated = prev.map((t) => {
        if (t.id === timerId) {
          return {
            ...t,
            remaining: t.duration,
            status: 'Paused',
            halfwayTriggered: false,
          };
        }
        return t;
      });
      AsyncStorage.setItem('@timers', JSON.stringify(updated));
      return updated;
    });
  };  
  
  const showCompletionModal = async (name) => {
    Alert.alert('⏰ Timer Complete!', `${name} is done!`);
  
    const newEntry = {
      name,
      time: new Date().toLocaleString(),
    };
  
    const existing = await AsyncStorage.getItem('@timer_history');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(newEntry);
    await AsyncStorage.setItem('@timer_history', JSON.stringify(history));
  };  

  const grouped = groupTimersByCategory(timers);

  const toggleCategory = (category) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const startAllInCategory = (category) => {
    timers
      .filter((t) => t.category === category && t.status !== 'Completed')
      .forEach((t) => startTimer(t.id));
  };
  
  const pauseAllInCategory = (category) => {
    timers
      .filter((t) => t.category === category && activeTimers[t.id])
      .forEach((t) => pauseTimer(t.id));
  };
  
  const resetAllInCategory = (category) => {
    timers
      .filter((t) => t.category === category)
      .forEach((t) => resetTimer(t.id));
  };  

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
        return '#4CAF50';
      case 'Paused':
        return '#FFC107';
      case 'Completed':
        return '#2196F3';
      default:
        return theme?.secondaryText || '#757575';
    }
  };

  const renderTimer = ({ item }) => {
    const isRunning = item.status === 'Running';
    const isCompleted = item.status === 'Completed';
    const progress = item.remaining / item.duration;
    
    return (
      <View style={[styles.timerCard, { backgroundColor: theme?.cardBackground || '#F5F5F5' }]}>
        <View style={styles.timerHeader}>
          <Text style={[styles.timerName, { color: theme?.primaryText || '#121212' }]}>{item.name}</Text>
          <Text style={[styles.timerStatus, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        
        <View style={styles.timerDetails}>
          <Text style={[styles.timeText, { color: theme?.secondaryText || '#757575' }]}>
            {formatTime(item.remaining)}
          </Text>
          <View style={styles.progressWrapper}>
            <TimerProgress 
              progress={progress} 
              color={isCompleted ? '#2196F3' : (isRunning ? '#4CAF50' : '#FFC107')}
            />
            <Text style={[styles.percentageText, { color: theme?.secondaryText || '#757575' }]}>
              {Math.round(progress * 100)}%
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <ThemedButton 
            title="Start" 
            onPress={() => startTimer(item.id)} 
            disabled={isRunning || isCompleted}
            style={styles.actionButton}
          />
          <ThemedButton 
            title="Pause" 
            variant="secondary"
            onPress={() => pauseTimer(item.id)} 
            disabled={!isRunning}
            style={styles.actionButton}
          />
          <ThemedButton 
            title="Reset" 
            variant="outline"
            onPress={() => resetTimer(item.id)} 
            style={styles.actionButton}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#FFFFFF' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme?.headerBackground || '#FFFFFF' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme?.primaryText || '#121212' }]}>My Timers</Text>
          <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={24} 
              color={theme?.accentColor || '#6200EE'} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerButtons}>
          <ThemedButton 
            title="Add Timer" 
            onPress={() => navigation.navigate('AddTimer')} 
            style={styles.headerButton}
          />
          <ThemedButton 
            title="History" 
            variant="outline"
            onPress={() => navigation.navigate('History')} 
            style={styles.headerButton}
          />
        </View>
      </View>
      
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme?.background || '#FFFFFF' }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(grouped).length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="timer-outline" size={64} color={theme?.secondaryText || '#757575'} />
            <Text style={[styles.emptyStateText, { color: theme?.secondaryText || '#757575' }]}>
              No timers yet. Add your first timer to get started!
            </Text>
          </View>
        ) : (
          Object.keys(grouped).map((category) => (
            <View key={category} style={styles.categoryWrapper}>
              <TouchableOpacity 
                onPress={() => toggleCategory(category)} 
                style={[styles.categoryHeader, { backgroundColor: theme?.categoryHeader || '#EFEFEF' }]}
              >
                <Text style={[styles.categoryTitle, { color: theme?.primaryText || '#121212' }]}>{category}</Text>
                <Ionicons 
                  name={expandedCategories[category] ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color={theme?.secondaryText || '#757575'}
                />
              </TouchableOpacity>
      
              {expandedCategories[category] && (
                <>
                  <View style={styles.bulkActions}>
                    <ThemedButton 
                      title="Start All" 
                      onPress={() => startAllInCategory(category)}
                      style={styles.bulkButton}
                    />
                    <ThemedButton 
                      title="Pause All" 
                      variant="secondary"
                      onPress={() => pauseAllInCategory(category)}
                      style={styles.bulkButton}
                    />
                    <ThemedButton 
                      title="Reset All" 
                      variant="outline"
                      onPress={() => resetAllInCategory(category)}
                      style={styles.bulkButton}
                    />
                  </View>
      
                  <FlatList
                    data={grouped[category]}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTimer}
                    scrollEnabled={false}
                  />
                </>
              )}
            </View>
          ))
        )}
        <View style={styles.scrollBottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};  

export default HomeScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0,0,0,0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  categoryWrapper: {
    marginBottom: 16,
  },
  categoryHeader: {
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  timerStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerDetails: {
    marginBottom: 12,
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressWrapper: {
    width: '100%',
  },
  percentageText: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  bulkActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bulkButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
  scrollBottomPadding: {
    height: 40,
  },
});