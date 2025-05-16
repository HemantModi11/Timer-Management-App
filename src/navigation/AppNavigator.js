import React, { useContext } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeContext, lightTheme } from '../context/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import AddTimerScreen from '../screens/AddTimerScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { theme = lightTheme, isDark = false } = useContext(ThemeContext) || {};

  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    dark: isDark,
    colors: {
      ...baseTheme.colors,
      primary: theme?.accentColor || '#6200EE',
      background: theme?.background || '#FFFFFF',
      card: theme?.headerBackground || '#FFFFFF',
      text: theme?.primaryText || '#121212',
      border: theme?.borderColor || '#DDDDDD',
      notification: theme?.notificationColor || '#FF3B30',
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme?.background || '#FFFFFF' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="AddTimer" component={AddTimerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;