// src/screens/ExerciseScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';
import { useNavigation } from '@react-navigation/native';

export default function ExerciseScreen() {
  const navigation = useNavigation();
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState([]);

  const addSet = () => {
    setSets([...sets, { id: Date.now(), reps: '', weight: '' }]);
  };

  const updateSet = (index, field, value) => {
    const newSets = [...sets];
    newSets[index][field] = value; 
    setSets(newSets);
  };

  const handleSaveExercise = () => {
    if (!exerciseName.trim()) {
      Alert.alert('Error', 'El nombre del ejercicio no puede estar vacío');
      return;
    }
    if (sets.length === 0) {
      Alert.alert('Error', 'Agrega al menos un set');
      return;
    }
    for (let i = 0; i < sets.length; i++) {
      if (!sets[i].reps.trim() || !sets[i].weight.trim()) {
        Alert.alert('Error', 'Completa todos los campos de los sets');
        return;
      }
    }
    const newExercise = {
      id: Date.now(),
      name: exerciseName,
      sets: sets,
    };
    // Envía el nuevo ejercicio a RoutineScreen
    navigation.navigate('RoutineScreen', { newExercise });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Nuevo Ejercicio</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del ejercicio"
        value={exerciseName}
        onChangeText={setExerciseName}
      />
      <Text style={styles.setsLabel}>Sets</Text>
      {sets.map((set, index) => (
        <View key={set.id} style={styles.setContainer}>
          <Text style={styles.setNumber}>Set {index + 1}</Text>
          <TextInput
            style={styles.inputSet}
            placeholder="Repeticiones"
            keyboardType="numeric"
            value={set.reps}
            onChangeText={(text) => updateSet(index, 'reps', text)}
          />
          <TextInput
            style={styles.inputSet}
            placeholder="Peso"
            keyboardType="numeric"
            value={set.weight}
            onChangeText={(text) => updateSet(index, 'weight', text)}
          />
        </View>
      ))}
      <CustomButton title="Agregar Set" onPress={addSet} />
      <CustomButton title="Guardar Ejercicio" onPress={handleSaveExercise} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, alignItems: 'center' },
  label: { fontSize: 20, marginBottom: 12 },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
  setsLabel: { fontSize: 18, marginBottom: 8 },
  setContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    marginBottom: 12,
  },
  setNumber: { fontSize: 16, marginBottom: 4 },
  inputSet: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    marginBottom: 8,
    borderRadius: 5,
  },
});
