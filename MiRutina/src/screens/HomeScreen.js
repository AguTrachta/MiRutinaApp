// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import CustomButton from '../components/CustomButton';
import * as MediaLibrary from 'expo-media-library';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [routines, setRoutines] = useState([]);

  useEffect(() => {
    checkStoredName();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [])
  );

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

  const loadRoutines = async () => {
    try {
      const stored = await AsyncStorage.getItem('routines');
      if (stored) {
        setRoutines(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error al cargar rutinas:', error);
    }
  };

  const handleDeleteRoutine = (routineId) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar esta rutina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedRoutines = routines.filter((r) => r.id !== routineId);
              setRoutines(updatedRoutines);
              await AsyncStorage.setItem('routines', JSON.stringify(updatedRoutines));
            } catch (error) {
              console.log('Error al eliminar la rutina:', error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderRoutineItem = ({ item }) => (
    <View style={styles.routineItem}>
      <TouchableOpacity
        style={styles.routineNameContainer}
        onPress={() =>
          navigation.navigate('RoutineScreen', { mode: 'view', routine: item })
        }
      >
        <Text
          style={styles.routineText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRoutine(item.id)}
      >
        <Text style={styles.deleteButtonText}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  // Función para exportar datos
  const exportData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      const routinesData = await AsyncStorage.getItem('routines');
      const data = {
        userName,
        routines: routinesData ? JSON.parse(routinesData) : [],
      };
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + 'myAppData.json';
  
      // Escribe el archivo en el directorio privado de la app
      await FileSystem.writeAsStringAsync(fileUri, json);
  
      // Solicita permisos para acceder a la librería multimedia
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permisos insuficientes", "Necesitamos permisos para guardar el archivo en Descargas.");
        return;
      }
  
      // Crea un asset a partir del archivo
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      // Crea (o agrega) el asset a un álbum público llamado "Download" (o "Descargas")
      await MediaLibrary.createAlbumAsync("Download", asset, false);
  
      // También puedes usar Sharing.shareAsync para permitir que el usuario lo guarde manualmente
      // await Sharing.shareAsync(fileUri);
  
      Alert.alert("Exportación exitosa", "El archivo se guardó en la carpeta de Descargas.");
    } catch (error) {
      console.log('Error al exportar datos: ', error);
      Alert.alert('Error', 'No se pudo exportar los datos.');
    }
  };

  // Función para importar datos
  const importData = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      if (result.type === 'success') {
        const json = await FileSystem.readAsStringAsync(result.uri);
        const data = JSON.parse(json);
        if (data.userName) {
          await AsyncStorage.setItem('userName', data.userName);
          setName(data.userName);
        }
        if (data.routines) {
          await AsyncStorage.setItem('routines', JSON.stringify(data.routines));
          setRoutines(data.routines);
        }
        Alert.alert('Importación exitosa', 'Los datos se han importado correctamente.');
      }
    } catch (error) {
      console.log('Error al importar datos: ', error);
      Alert.alert('Error', 'No se pudo importar los datos.');
    }
  };

  // Si no se ha guardado el nombre, mostramos la vista para ingresar el nombre
  if (showNameInput) {
    return (
      <View style={styles.container}>
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
      </View>
    );
  }

  // Vista principal
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {name}!</Text>
        <Text style={styles.subtitle}>¿Qué vas a entrenar hoy?</Text>
      </View>

      {/* Lista de rutinas */}
      <View style={styles.listContainer}>
        {routines.length === 0 ? (
          <Text style={styles.noRoutines}>No hay rutinas creadas</Text>
        ) : (
          <FlatList
            data={routines}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={renderRoutineItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* Botones de respaldo (exportar/importar) */}
      <View style={styles.backupContainer}>
        <TouchableOpacity style={styles.backupButton} onPress={exportData}>
          <Text style={styles.backupButtonText}>Exportar Datos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backupButton} onPress={importData}>
          <Text style={styles.backupButtonText}>Importar Datos</Text>
        </TouchableOpacity>
      </View>

      {/* Footer con botones fijos: Cronómetro a la izquierda, Agregar Rutina a la derecha */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.timerButton}
          onPress={() => navigation.navigate('TimerScreen')}
        >
          <Text style={styles.timerButtonText}>⏱ Cronómetro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.addRoutineButton}
          onPress={() => navigation.navigate('RoutineScreen', { mode: 'add' })}
        >
          <Text style={styles.addRoutineButtonText}>Agregar Rutina</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Contenedor general
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Encabezado
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginTop: 8,
    color: '#666',
  },
  // Lista de rutinas
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noRoutines: {
    fontSize: 16,
    color: '#777',
    marginTop: 20,
    textAlign: 'center',
  },
  routineItem: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  routineNameContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  routineText: {
    fontSize: 16,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Footer de la app: botones fijos
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E2E2E2',
  },
  timerButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addRoutineButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  addRoutineButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Botones de respaldo: Exportar/Importar
  backupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E2E2E2',
  },
  backupButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 5,
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  // Vista cuando no se ha guardado nombre
  inputContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
});
