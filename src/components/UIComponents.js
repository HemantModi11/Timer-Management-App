import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';

export const ThemedButton = ({ title, onPress, variant = 'primary', style, disabled }) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButtonText;
      case 'outline':
        return styles.outlineButtonText;
      default:
        return styles.primaryButtonText;
    }
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[getTextStyle(), disabled && styles.disabledText]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const TimerProgress = ({ progress, color }) => {
  return (
    <View style={styles.progressContainer}>
      <View
        style={[
          styles.progressBar,
          { width: `${progress * 100}%`, backgroundColor: color || '#4CAF50' },
        ]}
      />
    </View>
  );
};

export const ThemedCard = ({ children, style }) => {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#03DAC6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  secondaryButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6200EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  outlineButtonText: {
    color: '#6200EE',
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    borderColor: '#E0E0E0',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  progressContainer: {
    height: 8,
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});