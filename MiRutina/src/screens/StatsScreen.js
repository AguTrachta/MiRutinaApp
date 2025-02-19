
// src/screens/StatsScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';

export default function StatsScreen({ isVisible, onClose, exerciseName }) {
  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.content}>
        {/* Handle para indicar que se puede arrastrar */}
        <View style={styles.handle} />
        <Text style={styles.text}>Stats for {exerciseName}</Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 800, // Aumentamos la altura para que aparezca más arriba
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 10,
  },
  text: {
    fontSize: 20,
  },
});
