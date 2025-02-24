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
// Se ha removido: import * as MediaLibrary from 'expo-media-library';

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

  // Función para exportar datos (usa Sharing.shareAsync para que el usuario elija dónde guardar)
  const exportData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName');
      const routinesData = await AsyncStorage.getItem('routines');
      const data = {
        userName,
        routines: routinesData ? JSON.parse(routinesData) : [],
      };
      const json = JSON.stringify(data, null, 2);
      const fileUri = FileSystem.documentDirectory + 'gym_data.json';
  
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Exportar datos',
        });
      } else {
        Alert.alert('Error', 'Compartir archivos no es compatible en este dispositivo.');
      }
  
      Alert.alert("Exportación exitosa", "El archivo se ha guardado correctamente.");
    } catch (error) {
      console.error('Error al exportar datos:', error);
      Alert.alert('Error', 'No se pudo exportar los datos.');
    }
  };
  
  
  const importData = async () => {
    try {
      console.log('📂 Iniciando importación de datos...');
  
      // Permitir seleccionar JSON
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
  
      console.log('📄 Resultado del DocumentPicker:', result);
  
      // Verificar si el usuario realmente seleccionó un archivo
      if (!result.assets || result.assets.length === 0) {
        console.log('⛔ No se seleccionó ningún archivo.');
        Alert.alert('Error', 'No se seleccionó ningún archivo.');
        return;
      }
  
      // Obtener la URI del archivo seleccionado
      const fileUri = result.assets[0].uri;
      console.log('📄 Archivo seleccionado:', fileUri);
  
      // Leer el contenido del archivo
      const json = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      console.log('📥 Contenido del archivo leído:', json);
  
      let data;
      try {
        data = JSON.parse(json); // Intentar parsear el JSON
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        Alert.alert('Error', 'El archivo no tiene el formato correcto.');
        return;
      }
  
      console.log('✅ Datos parseados correctamente:', data);
  
      // Validar estructura del JSON
      if (!data || typeof data !== 'object' || !('userName' in data) || !('routines' in data)) {
        console.error('❌ El archivo no tiene la estructura esperada.');
        Alert.alert('Error', 'El archivo seleccionado no es válido.');
        return;
      }
  
      Alert.alert(
        'Confirmación',
        'Esto sobrescribirá los datos actuales. ¿Deseas continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Importar',
            style: 'destructive',
            onPress: async () => {
              try {
                console.log('📝 Guardando datos en AsyncStorage...');
  
                await AsyncStorage.setItem('userName', data.userName || '');
                await AsyncStorage.setItem('routines', JSON.stringify(data.routines || []));
  
                setName(data.userName || '');
                setRoutines(data.routines || []);
  
                console.log('✅ Importación exitosa.');
                Alert.alert('Importación exitosa', 'Los datos se han importado correctamente.');
              } catch (storageError) {
                console.error('❌ Error al guardar en AsyncStorage:', storageError);
                Alert.alert('Error', 'Hubo un problema al guardar los datos importados.');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('❌ Error en la importación:', error);
      Alert.alert('Error', 'No se pudo importar los datos.');
    }
  };
  
  
  // Si no se ha guardado el nombre, mostramos la vista para ingresarlo
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
  // Footer con botones fijos
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
