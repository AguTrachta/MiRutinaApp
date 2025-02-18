// src/screens/RoutineScreen.js
import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  FlatList,
  TouchableOpacity 
} from 'react-native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RoutineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, routine } = route.params || {};

  // Para modo "add": formulario para el nombre de la rutina.
  const [routineName, setRoutineName] = useState(routine ? routine.name : '');
  // Para modo "view": se guarda la rutina completa (con ejercicios)
  const [currentRoutine, setCurrentRoutine] = useState(routine || null);
  // Controla cuál ejercicio está expandido (solo uno a la vez)
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  // Estados para el formulario de agregar un ejercicio nuevo (global)
  const [addingExercise, setAddingExercise] = useState(false);
  const [newExerciseNameGlobal, setNewExerciseNameGlobal] = useState('');

  // Actualiza la rutina en AsyncStorage
  const updateRoutineInStorage = async (updatedRoutine) => {
    try {
      const stored = await AsyncStorage.getItem('routines');
      let routinesArray = stored ? JSON.parse(stored) : [];
      routinesArray = routinesArray.map((r) =>
        r.id === updatedRoutine.id ? updatedRoutine : r
      );
      await AsyncStorage.setItem('routines', JSON.stringify(routinesArray));
    } catch (error) {
      console.log('Error al actualizar rutina:', error);
    }
  };

  // Función para guardar o actualizar la rutina (modo "add" o "view")
  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'El nombre de la rutina no puede estar vacío');
      return;
    }
    if (mode === 'add') {
      // Crear la nueva rutina (con ejercicios vacíos)
      const newRoutine = { id: Date.now(), name: routineName, exercises: [] };
      try {
        const stored = await AsyncStorage.getItem('routines');
        const routinesArray = stored ? JSON.parse(stored) : [];
        routinesArray.push(newRoutine);
        await AsyncStorage.setItem('routines', JSON.stringify(routinesArray));
        navigation.replace('RoutineScreen', { mode: 'view', routine: newRoutine });
      } catch (error) {
        console.log('Error al guardar rutina:', error);
      }
    } else {
      // En modo view se actualiza la rutina con los sets del día
      await updateRoutineInStorage(currentRoutine);
      Alert.alert('Rutina guardada', 'La rutina se ha guardado correctamente.');
    }
  };

  // Alterna la expansión de un ejercicio
  const toggleExerciseExpansion = (exerciseId) => {
    if (expandedExerciseId === exerciseId) {
      setExpandedExerciseId(null);
    } else {
      setExpandedExerciseId(exerciseId);
    }
  };

  // Agrega un set a un ejercicio específico
  const handleAddSetToExercise = (exerciseId, newSet) => {
    const updatedExercises = currentRoutine.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: [...(ex.sets || []), newSet] };
      }
      return ex;
    });
    const updatedRoutine = { ...currentRoutine, exercises: updatedExercises };
    setCurrentRoutine(updatedRoutine);
    updateRoutineInStorage(updatedRoutine);
  };

  // Navega a StatsScreen (a implementar) pasando el ejercicio y la rutina
  const handleViewStats = (exercise) => {
    navigation.navigate('StatsScreen', { exercise, routineId: currentRoutine.id });
  };

  // Función para eliminar un ejercicio
  const handleDeleteExercise = (exerciseId) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este ejercicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedExercises = currentRoutine.exercises.filter(
              (ex) => ex.id !== exerciseId
            );
            const updatedRoutine = { ...currentRoutine, exercises: updatedExercises };
            setCurrentRoutine(updatedRoutine);
            updateRoutineInStorage(updatedRoutine);
            if (expandedExerciseId === exerciseId) {
              setExpandedExerciseId(null);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Componente para cada ejercicio
  const ExerciseItem = ({ exercise }) => {
    const [showSetForm, setShowSetForm] = useState(false);
    const [setReps, setSetReps] = useState('');
    const [setWeight, setSetWeight] = useState('');

    const isExpanded = expandedExerciseId === exercise.id;

    const handleSaveSet = () => {
      if (!setReps.trim() || !setWeight.trim()) {
        Alert.alert('Error', 'Completa reps y peso');
        return;
      }
      const newSet = { id: Date.now(), reps: setReps, weight: setWeight };
      handleAddSetToExercise(exercise.id, newSet);
      setSetReps('');
      setSetWeight('');
      setShowSetForm(false);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (!isExpanded) toggleExerciseExpansion(exercise.id);
        }}
      >
        <View style={styles.exerciseItem}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity onPress={() => handleDeleteExercise(exercise.id)}>
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.buttonRow}>
                <CustomButton
                  title="Agregar Set"
                  onPress={() => setShowSetForm(!showSetForm)}
                />
                <CustomButton
                  title="Ver Stats"
                  onPress={() => handleViewStats(exercise)}
                />
              </View>
              {showSetForm && (
                <View style={styles.setForm}>
                  <TextInput
                    style={styles.inputSet}
                    placeholder="Reps"
                    keyboardType="numeric"
                    value={setReps}
                    onChangeText={setSetReps}
                  />
                  <TextInput
                    style={styles.inputSet}
                    placeholder="Peso"
                    keyboardType="numeric"
                    value={setWeight}
                    onChangeText={setSetWeight}
                  />
                  <CustomButton title="Guardar Set" onPress={handleSaveSet} />
                </View>
              )}
              {exercise.sets && exercise.sets.length > 0 && (
                <View style={styles.setsContainer}>
                  {exercise.sets.map((set, index) => (
                    <Text key={set.id} style={styles.setText}>
                      Set {index + 1}: Reps: {set.reps}, Peso: {set.weight}
                    </Text>
                  ))}
                </View>
              )}
              {/* Botón verde "Listo" para contraer el ejercicio */}
              <CustomButton
                title="Listo"
                onPress={() => toggleExerciseExpansion(exercise.id)}
                style={styles.greenButton}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Si estamos en modo "add": formulario para ingresar el nombre de la nueva rutina
  if (mode === 'add') {
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Nueva Rutina</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la rutina"
          value={routineName}
          onChangeText={setRoutineName}
        />
        <CustomButton title="Guardar Rutina" onPress={handleSaveRoutine} />
      </View>
    );
  } else {
    if (!currentRoutine) {
      return (
        <View style={styles.container}>
          <Text style={styles.label}>Cargando rutina...</Text>
        </View>
      );
    }

    // Componente Footer para la FlatList: incluye el botón de Agregar Ejercicio y Guardar Rutina
    const renderFooter = useCallback(() => (
      <View style={styles.footerContainer}>
        {addingExercise ? (
          <View style={styles.newExerciseFormGlobal}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del ejercicio"
              value={newExerciseNameGlobal}
              onChangeText={setNewExerciseNameGlobal}
              blurOnSubmit={false} // Evita que se cierre el teclado al enviar
              returnKeyType="done" // Define la tecla de acción como "done"
              onSubmitEditing={() => {}}
            />
            <CustomButton
              title="Guardar Ejercicio"
              onPress={() => {
                if (!newExerciseNameGlobal.trim()) {
                  Alert.alert('Error', 'El nombre del ejercicio no puede estar vacío');
                  return;
                }
                const newExercise = { id: Date.now(), name: newExerciseNameGlobal, sets: [] };
                const updatedExercises = [...(currentRoutine.exercises || []), newExercise];
                const updatedRoutine = { ...currentRoutine, exercises: updatedExercises };
                setCurrentRoutine(updatedRoutine);
                updateRoutineInStorage(updatedRoutine);
                setNewExerciseNameGlobal('');
                setAddingExercise(false);
              }}
            />
            <CustomButton title="Cancelar" onPress={() => setAddingExercise(false)} />
          </View>
        ) : (
          <CustomButton title="Agregar Ejercicio" onPress={() => setAddingExercise(true)} />
        )}
        <CustomButton title="Guardar Rutina" onPress={handleSaveRoutine} />
      </View>
    ), [addingExercise, newExerciseNameGlobal, currentRoutine]);

    return (
      <FlatList
        keyboardShouldPersistTaps="always" // Evita que se cierre el teclado
        data={currentRoutine.exercises || []}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : index.toString()
        }
        renderItem={({ item }) => <ExerciseItem exercise={item} />}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.routineTitle}>Rutina: {currentRoutine?.name}</Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay ejercicios agregados</Text>
        }
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.flatListContent}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  flatListContent: {
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  routineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  newExerciseFormGlobal: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
  exerciseItem: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 14,
  },
  expandedContent: {
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  setForm: {
    marginTop: 10,
  },
  inputSet: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    marginBottom: 8,
    borderRadius: 5,
  },
  setsContainer: {
    marginTop: 10,
  },
  setText: {
    fontSize: 16,
  },
  greenButton: {
    backgroundColor: 'green',
    marginTop: 10,
  },
});
