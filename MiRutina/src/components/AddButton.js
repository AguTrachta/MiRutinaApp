// src/components/AddButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function AddButton({ onPress }) {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.button}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <Text style={styles.text}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 10,
    marginRight: 10,
  },
  text: {
    fontSize: 28,
    color: '#007AFF',
  },
});
