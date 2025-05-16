import React, { useEffect, useState, useContext } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, lightTheme } from '../context/ThemeContext';
import { ThemedButton } from '../components/UIComponents';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen({ navigation }) {
  const { theme = lightTheme, isDark = false } = useContext(ThemeContext) || {};
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const storedHistory = await AsyncStorage.getItem('@timer_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.log('Failed to load history', e);
      Alert.alert('Error', 'Failed to load timer history');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all timer history? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('@timer_history');
              setHistory([]);
            } catch (e) {
              console.log('Failed to clear history', e);
              Alert.alert('Error', 'Failed to clear timer history');
            }
          }
        }
      ]
    );
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderItem = ({ item }) => (
    <View style={[styles.historyItem, { backgroundColor: theme?.cardBackground || '#F5F5F5' }]}>
      <View style={styles.historyContent}>
        <Text style={[styles.historyName, { color: theme?.primaryText || '#121212' }]}>
          {item.name}
        </Text>
        <Text style={[styles.historyTime, { color: theme?.secondaryText || '#757575' }]}>
          {formatDate(item.completedAt)}
        </Text>
      </View>
      <Ionicons 
        name="checkmark-circle" 
        size={24} 
        color={theme?.accentColor || '#6200EE'} 
      />
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="time-outline" 
        size={64} 
        color={theme?.secondaryText || '#757575'} 
      />
      <Text style={[styles.emptyStateText, { color: theme?.secondaryText || '#757575' }]}>
        No completed timers yet.
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: theme?.tertiaryText || '#9E9E9E' }]}>
        Complete timers to see your history here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#FFFFFF' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme?.headerBackground || '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme?.accentColor || '#6200EE'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme?.primaryText || '#121212' }]}>Timer History</Text>
        <TouchableOpacity onPress={clearHistory} style={styles.clearButton} disabled={history.length === 0}>
          <Ionicons 
            name="trash-outline" 
            size={24} 
            color={history.length === 0 ? (theme?.disabledText || '#CCCCCC') : (theme?.dangerColor || '#F44336')} 
          />
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme?.secondaryText || '#757575' }]}>
            Loading timer history...
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item, index) => `history-${index}`}
          renderItem={renderItem}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={[
            styles.listContent,
            history.length === 0 && styles.emptyListContent
          ]}
          style={[styles.list, { backgroundColor: theme?.background || '#FFFFFF' }]}
        />
      )}
      
      <View style={[styles.footer, { backgroundColor: theme?.background || '#FFFFFF' }]}>
        <ThemedButton 
          title="Return to Timers" 
          onPress={() => navigation.goBack()} 
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyContent: {
    flex: 1,
  },
  historyName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  historyTime: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerButton: {
    width: '100%',
  },
});