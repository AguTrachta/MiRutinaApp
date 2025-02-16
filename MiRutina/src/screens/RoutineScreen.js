// src/screens/RoutineScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RoutineScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, routine, onSave } = route.params || {};
  const [routineName, setRoutineName] = useState(routine ? routine.name : '');

  const handleSave = () => {
    if (mode === 'add') {
      // Crea la nueva rutina y llama al callback para actualizar HomeScreen
      const newRoutine = { name: routineName };
      if (onSave) {
        onSave(newRoutine);
      }
      navigation.goBack();
    } else {
      // En modo "view", solo vuelve a HomeScreen
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {mode === 'add' ? (
        <>
          <Text style={styles.label}>Nueva Rutina</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la rutina"
            value={routineName}
            onChangeText={setRoutineName}
          />
          <CustomButton title="Guardar Rutina" onPress={handleSave} />
        </>
      ) : (
        <>
          <Text style={styles.label}>Rutina</Text>
          <Text style={styles.routineName}>{routineName}</Text>
          <CustomButton title="Volver" onPress={() => navigation.goBack()} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 20, marginBottom: 12 },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
  routineName: { fontSize: 18, marginBottom: 20 },
});
