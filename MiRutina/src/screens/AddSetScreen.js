// Ejemplo de AddSetScreen.js con estilo flotante
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AddSetScreen() {
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');

  const navigation = useNavigation();
  const route = useRoute();

  const { routine, exerciseId } = route.params || {};

  const handleSaveSet = async () => {
    if (!reps.trim() || !weight.trim()) {
      Alert.alert('Error', 'Completa reps y peso');
      return;
    }
    const newSet = {
      id: Date.now(),
      reps,
      weight,
      timestamp: new Date().getTime(),
    };
    const updatedExercises = routine.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: [...(ex.sets || []), newSet] };
      }
      return ex;
    });
    const updatedRoutine = { ...routine, exercises: updatedExercises };

    try {
      const stored = await AsyncStorage.getItem('routines');
      let routinesArray = stored ? JSON.parse(stored) : [];
      routinesArray = routinesArray.map(r =>
        r.id === updatedRoutine.id ? updatedRoutine : r
      );
      await AsyncStorage.setItem('routines', JSON.stringify(routinesArray));
    } catch (error) {
      console.log('Error al actualizar rutina:', error);
    }
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.overlay}>
      {/* Contenedor "flotante" en el centro */}
      <View style={styles.modalContent}>
        <Text style={styles.title}>Agregar Set</Text>
        <TextInput
          style={styles.input}
          placeholder="Reps"
          keyboardType="numeric"
          value={reps}
          onChangeText={setReps}
        />
        <TextInput
          style={styles.input}
          placeholder="Peso"
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />
        <CustomButton title="Guardar Set" onPress={handleSaveSet} />
        <CustomButton title="Cancelar" onPress={handleCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Hace que el contenedor ocupe la pantalla con fondo semitransparente
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',  // Dejamos transparente porque ya lo oscurece el cardStyle
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
    textAlign: 'center',
  },
});

