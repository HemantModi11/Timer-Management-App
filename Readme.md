# React Native Timer App

## Overview

This React Native app enables users to create, manage, and track multiple customizable timers with features including:

* Timer creation with name, duration, category, and halfway alerts
* Running multiple timers simultaneously with start, pause, reset controls
* Grouping timers by categories and performing bulk actions
* Visual progress indicators for active timers
* History tracking of completed timers
* Light and dark mode support with a theme switcher

---

## Features

* **Timer Creation and Management:** Add timers with detailed settings and halfway alerts
* **Grouping and Bulk Actions:** Filter timers by category and manage them in bulk
* **Progress Visualization:** Shows timer progress dynamically
* **History Tracking:** Completed timers are saved and viewable in history
* **Custom Themes:** Toggle between light and dark themes for better UX

---

## Setup Instructions

### Prerequisites

* Node.js (>=14.x recommended)
* npm or yarn
* React Native CLI or Expo CLI installed
* Android Studio or Xcode for emulators or physical devices

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/react-native-timer-app.git
   cd react-native-timer-app
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the app

* For Android

  ```bash
  npx react-native run-android
  ```

* For iOS

  ```bash
  npx react-native run-ios
  ```

4. (Optional) Start Metro bundler if it doesn’t start automatically

   ```bash
   npx react-native start
   ```

---

## Project Structure

* `App.js` – Root component wrapped with ThemeProvider
* `ThemeContext.js` – Theme management with light/dark modes
* `screens/` – All screen components (AddTimer, Home, History, etc.)
* `components/` – Reusable UI components (TimerCard, CategoryFilter, etc.)
* `utils/` – Helper functions and storage handlers
* `assets/` – Static assets like icons and images

---

## Assumptions Made

* Timer durations are entered in seconds for simplicity
* User device supports React Native and AsyncStorage (no backend persistence)
* Timers run only while the app is active (no background timer support)
* The halfway alert is based on exact halfway point in seconds
* Dark mode follows system preferences but can be toggled manually
* Bulk actions are limited to pause, resume, or reset for grouped timers
* No authentication required; app is intended for personal use
* Alert dialogs are sufficient for notifications (no push notifications)