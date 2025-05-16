import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const lightTheme = {
  background: '#FFFFFF',
  cardBackground: '#F5F5F5',
  text: '#121212',
  primaryText: '#121212',
  secondaryText: '#757575',
  accentColor: '#6200EE',
  buttonBackground: '#6200EE',
  buttonText: '#FFFFFF',
  border: '#E0E0E0',
  progressBackground: '#E0E0E0',
  progressFill: '#4CAF50',
  categoryHeader: '#EFEFEF',
  headerBackground: '#FFFFFF',
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  }
};

export const darkTheme = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  primaryText: '#FFFFFF',
  secondaryText: '#BBBBBB',
  accentColor: '#BB86FC',
  buttonBackground: '#BB86FC',
  buttonText: '#121212',
  border: '#333333',
  progressBackground: '#333333',
  progressFill: '#4CAF50',
  categoryHeader: '#2D2D2D',
  headerBackground: '#121212',
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  }
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_preference');
        if (savedTheme !== null) {
          setIsDark(savedTheme === 'dark');
        } else {
          setIsDark(deviceTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      }
    };
    loadTheme();
  }, [deviceTheme]);

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      await AsyncStorage.setItem('@theme_preference', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );  
};