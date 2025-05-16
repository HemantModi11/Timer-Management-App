import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeContext, lightTheme } from '../context/ThemeContext';
import { ThemedButton } from '../components/UIComponents';
import { Ionicons } from '@expo/vector-icons';

const AddTimerScreen = ({ navigation }) => {
  const { theme = lightTheme, isDark = false } = useContext(ThemeContext) || {};
  
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [halfwayAlert, setHalfwayAlert] = useState(false);

  const saveTimer = async () => {
    if (!name || !duration || !category) {
      Alert.alert('Incomplete Information', 'Please fill all required fields');
      return;
    }

    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid positive number for duration');
      return;
    }

    const newTimer = {
      id: Date.now().toString(),
      name,
      duration: parseInt(duration),
      remaining: parseInt(duration),
      category,
      status: 'Paused',
      halfwayAlert,
      halfwayTriggered: false,
    };    

    try {
      const jsonValue = await AsyncStorage.getItem('@timers');
      const timers = jsonValue != null ? JSON.parse(jsonValue) : [];
      timers.push(newTimer);
      await AsyncStorage.setItem('@timers', JSON.stringify(timers));
      Alert.alert('Success', 'Timer saved successfully!');
      navigation.goBack();
    } catch (e) {
      console.error('Failed to save timer:', e);
      Alert.alert('Error', 'Failed to save timer. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme?.background || '#FFFFFF' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme?.headerBackground || '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme?.accentColor || '#6200EE'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme?.primaryText || '#121212' }]}>Add New Timer</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView 
        style={[styles.scrollView, { backgroundColor: theme?.background || '#FFFFFF' }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.formCard, { backgroundColor: theme?.cardBackground || '#F5F5F5' }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme?.secondaryText || '#757575' }]}>Timer Name</Text>
            <TextInput
              placeholder="Enter timer name"
              placeholderTextColor={theme?.placeholderText || '#AAAAAA'}
              style={[styles.input, { 
                color: theme?.primaryText || '#121212',
                borderColor: theme?.borderColor || '#DDDDDD',
                backgroundColor: theme?.inputBackground || '#FFFFFF'
              }]}
              value={name}
              onChangeText={setName}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme?.secondaryText || '#757575' }]}>Duration (seconds)</Text>
            <TextInput
              placeholder="Enter duration in seconds"
              placeholderTextColor={theme?.placeholderText || '#AAAAAA'}
              style={[styles.input, { 
                color: theme?.primaryText || '#121212',
                borderColor: theme?.borderColor || '#DDDDDD',
                backgroundColor: theme?.inputBackground || '#FFFFFF'
              }]}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme?.secondaryText || '#757575' }]}>Category</Text>
            <TextInput
              placeholder="E.g., Workout, Cooking, Study"
              placeholderTextColor={theme?.placeholderText || '#AAAAAA'}
              style={[styles.input, { 
                color: theme?.primaryText || '#121212',
                borderColor: theme?.borderColor || '#DDDDDD',
                backgroundColor: theme?.inputBackground || '#FFFFFF'
              }]}
              value={category}
              onChangeText={setCategory}
            />
          </View>
          
          <View style={styles.switchRow}>
            <Text style={[styles.switchLabel, { color: theme?.primaryText || '#121212' }]}>
              Enable Halfway Alert
            </Text>
            <Switch
              value={halfwayAlert}
              onValueChange={setHalfwayAlert}
              trackColor={{ 
                false: theme?.switchTrackOff || '#CCCCCC', 
                true: theme?.accentColor || '#6200EE' 
              }}
              thumbColor={halfwayAlert ? 
                theme?.switchThumbOn || '#FFFFFF' : 
                theme?.switchThumbOff || '#F5F5F5'
              }
              ios_backgroundColor={theme?.switchTrackOff || '#CCCCCC'}
            />
          </View>
          
          <Text style={[styles.helpText, { color: theme?.secondaryText || '#757575' }]}>
            If enabled, you'll receive an alert when timer reaches halfway point.
          </Text>
        </View>
      </ScrollView>
      
      <View style={[styles.footer, { backgroundColor: theme?.background || '#FFFFFF' }]}>
        <ThemedButton 
          title="Cancel" 
          variant="outline"
          onPress={() => navigation.goBack()} 
          style={styles.footerButton}
        />
        <ThemedButton 
          title="Save Timer" 
          onPress={saveTimer} 
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddTimerScreen;

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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});