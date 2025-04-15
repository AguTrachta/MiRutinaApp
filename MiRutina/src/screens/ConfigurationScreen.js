// src/screens/ConfigurationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ConfigurationScreen() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadDarkModePreference();
  }, []);

  const loadDarkModePreference = async () => {
    try {
      const storedValue = await AsyncStorage.getItem('darkMode');
      if (storedValue) {
        setDarkMode(JSON.parse(storedValue));
      }
    } catch (error) {
      console.log('Error al cargar la preferencia de modo oscuro:', error);
    }
  };

  const handleToggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));
    } catch (error) {
      console.log('Error al guardar el modo oscuro:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.settingRow}>
        <Text style={styles.label}>Modo Oscuro</Text>
        <Switch
          value={darkMode}
          onValueChange={handleToggleDarkMode}
        />
      </View>

      <Text style={styles.note}>
        (Más configuraciones vendrán pronto)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,          // un poco de espacio arriba
    justifyContent: 'flex-start',
    backgroundColor: '#F8F9FA',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,       // separa la línea del resto
  },
  label: {
    fontSize: 18,
    color: '#333',
  },
  note: {
    marginTop: 10,
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
  },
});

