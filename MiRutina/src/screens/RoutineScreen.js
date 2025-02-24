// src/screens/RoutineScreen.js
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

// Componente para el formulario de agregar ejercicio (se usa React.memo para evitar re-render innecesario)
const AddExerciseForm = React.memo(({ 
  newExerciseName, 
  onChangeText, 
  onSave, 
  onCancel 
}) => {
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
        onSubmitEditing={() => {}}
      />
      <CustomButton title="Guardar Ejercicio" onPress={onSave} />
      <CustomButton title="Cancelar" onPress={onCancel} />
    </View>
  );
});

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
  // Estado para controlar la visibilidad del modal de Stats
  const [isStatsVisible, setIsStatsVisible] = useState(false);
  // Estado para almacenar el ejercicio seleccionado (para mostrar su nombre en Stats)
  const [selectedExercise, setSelectedExercise] = useState(null);
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
    setExpandedExerciseId(expandedExerciseId === exerciseId ? null : exerciseId);
  };

  // Agrega un set a un ejercicio específico (ahora incluye timestamp)
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

  // Al presionar "Ver Stats", guarda el ejercicio seleccionado y muestra el modal
  const handleViewStats = (exercise) => {
    setSelectedExercise(exercise);
    setIsStatsVisible(true);
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
      // Agregamos el timestamp para identificar la fecha del set
      const newSet = {
        id: Date.now(),
        reps: setReps,
        weight: setWeight,
        timestamp: new Date().getTime(),
      };
      handleAddSetToExercise(exercise.id, newSet);
      setSetReps('');
      setSetWeight('');
      setShowSetForm(false);
    };

    return (
      <View style={styles.exerciseItem}>
        {/* Cabecera con nombre (para expandir) y botón Eliminar */}
        <View style={styles.exerciseHeader}>
          {/* Tocar el nombre para expandir/colapsar */}
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

          {/* Botón Eliminar, separado para que sea clickeable */}
          <TouchableOpacity onPress={() => handleDeleteExercise(exercise.id)}>
            <Text style={styles.deleteButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>

        {/* Contenido expandido */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.buttonRow}>
              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Agregar Set"
                  onPress={() => setShowSetForm(!showSetForm)}
                />
              </View>
              <View style={styles.buttonContainer}>
                <CustomButton
                  title="Ver Stats"
                  onPress={() => handleViewStats(exercise)}
                />
              </View>
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

  // Si estamos en modo "add": solo el formulario para crear la rutina
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
    // Modo "view": mostrando la rutina con ejercicios
    if (!currentRoutine) {
      return (
        <View style={styles.container}>
          <Text style={styles.label}>Cargando rutina...</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
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
          contentContainerStyle={styles.flatListContent}
        />

        {/* Formulario de agregar ejercicio */}
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
          <CustomButton
            title="Agregar Ejercicio"
            onPress={() => setAddingExercise(true)}
          />
        )}

        <CustomButton title="Guardar Rutina" onPress={handleSaveRoutine} />

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
  container: {
    flex: 1,
    padding: 16,
    // alignItems: 'center', // Opcional. Si lo quitas, ocupará toda la pantalla horizontal
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
  newExerciseFormGlobal: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    marginVertical: 16,
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
    alignSelf: 'center',
  },
  // -- Ejercicio --
  exerciseItem: {
    width: '90%',          // <--- AQUI para que ocupe el 90% del contenedor
    alignSelf: 'center',   // Centra horizontalmente
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 5,
    marginBottom: 10,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,           // Altura fija de la cabecera
    paddingHorizontal: 10,
  },
  nameContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  deleteButtonText: {
    color: 'red',
    fontSize: 14,
    marginLeft: 10,
  },
  expandedContent: {
    padding: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
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
  label: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
});
