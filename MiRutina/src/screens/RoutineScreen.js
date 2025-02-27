import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import StatsScreen from './StatsScreen'; // Modal deslizable
import Icon from 'react-native-vector-icons/MaterialIcons';

// Componente para el formulario de agregar ejercicio
const AddExerciseForm = React.memo(
  ({ newExerciseName, onChangeText, onSave, onCancel }) => {
    return (
      <View style={styles.newExerciseFormGlobal}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del ejercicio"
          value={newExerciseName}
          onChangeText={onChangeText}
          autoFocus={true}
          blurOnSubmit={false}
          returnKeyType="done"
        />
        <CustomButton title="Guardar Ejercicio" onPress={onSave} />
        <CustomButton title="Cancelar" onPress={onCancel} />
      </View>
    );
  }
);

export default function RoutineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, routine } = route.params || {};

  const [routineName, setRoutineName] = useState(routine ? routine.name : '');
  const [currentRoutine, setCurrentRoutine] = useState(routine || null);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [addingExercise, setAddingExercise] = useState(false);
  const [newExerciseNameGlobal, setNewExerciseNameGlobal] = useState('');

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

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'El nombre de la rutina no puede estar vacío');
      return;
    }
    if (mode === 'add') {
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
      await updateRoutineInStorage(currentRoutine);
      Alert.alert('Rutina guardada', 'La rutina se ha guardado correctamente.');
    }
  };

  const toggleExerciseExpansion = (exerciseId) => {
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };

  const handleViewStats = (exercise) => {
    setSelectedExercise(exercise);
    setIsStatsVisible(true);
  };

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

  const ExerciseItem = ({ exercise }) => {
    const isExpanded = expandedExerciseId === exercise.id;

    const handleOpenAddSetScreen = () => {
      navigation.navigate('AddSetScreen', {
        routine: currentRoutine,
        exerciseId: exercise.id,
      });
    };

    return (
      <View style={styles.exerciseItem}>
        <View style={styles.exerciseHeader}>
          <TouchableOpacity
            style={styles.nameContainer}
            onPress={() => toggleExerciseExpansion(exercise.id)}
          >
            <Text
              style={styles.exerciseName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {exercise.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteExercise(exercise.id)}
            accessibilityLabel="Eliminar ejercicio"
          >
            <Icon name="delete" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Agregar Set"
                  onPress={handleOpenAddSetScreen}
                />
              </View>
              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Ver Stats"
                  onPress={() => handleViewStats(exercise)}
                />
              </View>
            </View>

            <CustomButton
              title="Listo"
              onPress={() => toggleExerciseExpansion(exercise.id)}
              style={styles.greenButton}
            />
          </View>
        )}
      </View>
    );
  };

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

    return (
      <View style={styles.mainContainer}>
        <View style={styles.listContainer}>
          <FlatList
            keyboardShouldPersistTaps="always"
            data={currentRoutine.exercises || []}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={({ item }) => <ExerciseItem exercise={item} />}
            ListHeaderComponent={
              <View style={styles.headerContainer}>
                <Text style={styles.routineTitle}>
                  Rutina: {currentRoutine?.name}
                </Text>
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No hay ejercicios agregados</Text>
            }
            contentContainerStyle={{ paddingBottom: 120 }}
          />
        </View>

        <View style={styles.footer}>
          {addingExercise ? (
            <AddExerciseForm
              newExerciseName={newExerciseNameGlobal}
              onChangeText={setNewExerciseNameGlobal}
              onSave={() => {
                if (!newExerciseNameGlobal.trim()) {
                  Alert.alert('Error', 'El nombre del ejercicio no puede estar vacío');
                  return;
                }
                const newExercise = {
                  id: Date.now(),
                  name: newExerciseNameGlobal,
                  sets: [],
                };
                const updatedExercises = [
                  ...(currentRoutine.exercises || []),
                  newExercise,
                ];
                const updatedRoutine = {
                  ...currentRoutine,
                  exercises: updatedExercises,
                };
                setCurrentRoutine(updatedRoutine);
                updateRoutineInStorage(updatedRoutine);
                setNewExerciseNameGlobal('');
                setAddingExercise(false);
              }}
              onCancel={() => setAddingExercise(false)}
            />
          ) : (
            <>
              <CustomButton
                title="Agregar Ejercicio"
                onPress={() => setAddingExercise(true)}
              />
              <CustomButton
                title="Guardar Rutina"
                onPress={handleSaveRoutine}
              />
            </>
          )}
        </View>

        <StatsScreen
          isVisible={isStatsVisible}
          onClose={() => setIsStatsVisible(false)}
          exerciseName={selectedExercise ? selectedExercise.name : ''}
          exerciseSets={selectedExercise ? selectedExercise.sets : []}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  listContainer: { flex: 1, padding: 16 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerContainer: { alignItems: 'center', marginBottom: 16 },
  routineTitle: { fontSize: 24, fontWeight: 'bold' },
  newExerciseFormGlobal: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
  },
  emptyText: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  input: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
    alignSelf: 'center',
  },
  exerciseItem: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'center',
    paddingBottom: 5,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
  },
  nameContainer: { flex: 1, justifyContent: 'center' },
  exerciseName: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  deleteButton: {
    backgroundColor: 'red',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  expandedContent: { padding: 10 },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  buttonContainer: { flex: 1, marginHorizontal: 5 },
  greenButton: { backgroundColor: 'green', marginTop: 10 },
  label: { fontSize: 18, marginBottom: 8, textAlign: 'center' },
});

