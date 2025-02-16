// src/screens/HomeScreen.js
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../components/CustomButton';
import AddButton from '../components/AddButton';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [routines, setRoutines] = useState([]); // Lista de rutinas

  useEffect(() => {
    checkStoredName();
  }, []);

  // Configura el botón (+) en la cabecera para navegar a RoutineScreen en modo "add" con un callback
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AddButton
          onPress={() =>
            navigation.navigate('RoutineScreen', {
              mode: 'add',
              onSave: (newRoutine) =>
                setRoutines((prevRoutines) => [...prevRoutines, newRoutine]),
            })
          }
        />
      ),
    });
  }, [navigation]);

  const checkStoredName = async () => {
    try {
      const storedName = await AsyncStorage.getItem('userName');
      if (storedName) {
        setName(storedName);
        setShowNameInput(false);
      } else {
        setShowNameInput(true);
      }
    } catch (error) {
      console.log('Error al leer AsyncStorage:', error);
    }
  };

  const handleSaveName = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      setShowNameInput(false);
    } catch (error) {
      console.log('Error al guardar el nombre:', error);
    }
  };

  const renderRoutineItem = ({ item }) => (
    <TouchableOpacity
      style={styles.routineItem}
      onPress={() =>
        navigation.navigate('RoutineScreen', { mode: 'view', routine: item })
      }
    >
      <Text style={styles.routineText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {showNameInput ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Ingresa tu nombre:</Text>
          <TextInput
            style={styles.input}
            placeholder="Tu nombre"
            value={name}
            onChangeText={setName}
          />
          <CustomButton title="Guardar Nombre" onPress={handleSaveName} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.greeting}>¡Hola, {name}!</Text>
          <Text style={styles.subtitle}>¿Qué vas a entrenar hoy?</Text>

          {routines.length === 0 ? (
            <Text style={styles.noRoutines}>No hay rutinas creadas</Text>
          ) : (
            <FlatList
              data={routines}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderRoutineItem}
              contentContainerStyle={{ width: '100%' }}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inputContainer: { marginTop: 40, alignItems: 'center' },
  label: { fontSize: 18, marginBottom: 8 },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
  contentContainer: { flex: 1, alignItems: 'center', marginTop: 20 },
  greeting: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 18, marginTop: 8, marginBottom: 20 },
  noRoutines: { fontSize: 16, color: '#777', marginVertical: 20 },
  routineItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    borderRadius: 5,
    marginBottom: 10,
  },
  routineText: { fontSize: 16 },
});
