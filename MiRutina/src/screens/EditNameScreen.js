// src/screens/EditNameScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../components/CustomButton';

export default function EditNameScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // Parám. obligatorios: type ('exercise' o 'routine'), existingName
  // Opcionales: routineId, exerciseId (si type === 'exercise')
  // Callback onSaveName
  const {
    type,
    routineId,
    exerciseId,
    existingName,
    onSaveName, 
  } = route.params || {};

  const [newName, setNewName] = useState(existingName || '');

  const handleSaveName = async () => {
    if (!newName.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    try {
      // 1) Lee todas las rutinas
      const stored = await AsyncStorage.getItem('routines');
      let routinesArray = stored ? JSON.parse(stored) : [];

      if (type === 'routine') {
        // Buscar la rutina que queremos editar
        const indexRoutine = routinesArray.findIndex(r => r.id === routineId);
        if (indexRoutine < 0) {
          Alert.alert('Error', 'No se encontró la rutina en el almacenamiento');
          return;
        }
        // Cambiar el nombre de la rutina
        routinesArray[indexRoutine] = {
          ...routinesArray[indexRoutine],
          name: newName,
        };
      } else if (type === 'exercise') {
        // Buscar la rutina y el ejercicio
        const indexRoutine = routinesArray.findIndex(r => r.id === routineId);
        if (indexRoutine < 0) {
          Alert.alert('Error', 'No se encontró la rutina en el almacenamiento');
          return;
        }
        const updatedExercises = routinesArray[indexRoutine].exercises.map(ex => {
          if (ex.id === exerciseId) {
            return { ...ex, name: newName };
          }
          return ex;
        });
        routinesArray[indexRoutine] = {
          ...routinesArray[indexRoutine],
          exercises: updatedExercises,
        };
      } else {
        Alert.alert('Error', 'Tipo no válido de edición');
        return;
      }

      // 2) Guardar en AsyncStorage
      await AsyncStorage.setItem('routines', JSON.stringify(routinesArray));

      // 3) Llamar callback para refrescar
      if (onSaveName) {
        onSaveName(routineId);
      }

      // 4) Volver a la pantalla anterior
      navigation.goBack();
    } catch (error) {
      console.log('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Título dinámico
  const screenTitle = type === 'routine' ? 'Editar Rutina' : 'Editar Ejercicio';

  return (
    <View style={styles.overlay}>
      <View style={styles.modalContent}>
        <Text style={styles.title}>{screenTitle}</Text>
        <TextInput
          style={styles.input}
          placeholder="Nuevo nombre"
          value={newName}
          onChangeText={setNewName}
        />
        <CustomButton title="Guardar" onPress={handleSaveName} />
        <CustomButton title="Cancelar" onPress={handleCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'transparent', 
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

