// src/components/AddButton.js
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

export default function AddButton({ onPress }) {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          console.log('Botón + presionado');
          onPress();
        }}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed
        ]}
      >
        <Text style={styles.text}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Área grande para que sea fácil tocar
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'pink', // color llamativo para verificar el área
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    // El Pressable ocupa todo el contenedor
    width: '100%',
    height: '100%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    // Efecto al presionar
    opacity: 0.5,
  },
  text: {
    fontSize: 30,
    color: '#007AFF',
  },
});
