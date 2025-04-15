// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function HomeScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [routines, setRoutines] = useState([]);

  // Eliminamos cualquier botón de configuración del header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => null,
    });
  }, [navigation]);

  useEffect(() => {
    checkStoredName();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoutines();
    }, [])
  );

  // Verifica si existe un nombre guardado en AsyncStorage
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

  // Guarda el nombre del usuario
  const handleSaveName = async () => {
    try {
      await AsyncStorage.setItem('userName', name);
      setShowNameInput(false);
    } catch (error) {
      console.log('Error al guardar el nombre:', error);
    }
  };

  // Carga las rutinas guardadas
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

  // Refresca las rutinas
  const handleRefreshRoutines = async () => {
    try {
      const stored = await AsyncStorage.getItem('routines');
      if (stored) {
        setRoutines(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error al refrescar rutinas:', error);
    }
  };

  // Elimina una rutina
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

  // Renderiza cada rutina de la lista
  const renderRoutineItem = ({ item }) => (
    <View style={styles.routineItem}>
      <TouchableOpacity
        style={styles.routineNameContainer}
        onPress={() =>
          navigation.navigate('RoutineScreen', { mode: 'view', routine: item })
        }
      >
        <Text style={styles.routineText} numberOfLines={1} ellipsizeMode="tail">
          {item.name}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => {
          navigation.navigate('EditNameScreen', {
            type: 'routine',
            routineId: item.id,
            existingName: item.name,
            onSaveName: handleRefreshRoutines,
          });
        }}
      >
        <Icon name="edit" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteRoutine(item.id)}
        accessibilityLabel="Eliminar rutina"
      >
        <Icon name="delete" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // Exportar datos (usuario + rutinas)
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

      Alert.alert('Exportación exitosa', 'El archivo se ha guardado correctamente.');
    } catch (error) {
      console.error('Error al exportar datos:', error);
      Alert.alert('Error', 'No se pudo exportar los datos.');
    }
  };

  // Importar datos
  const importData = async () => {
    try {
      console.log('📂 Iniciando importación de datos...');
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/json' });
      console.log('📄 Resultado del DocumentPicker:', result);

      if (!result.assets || result.assets.length === 0) {
        console.log('⛔ No se seleccionó ningún archivo.');
        Alert.alert('Error', 'No se seleccionó ningún archivo.');
        return;
      }

      const fileUri = result.assets[0].uri;
      console.log('📄 Archivo seleccionado:', fileUri);

      const json = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      console.log('📥 Contenido del archivo leído:', json);

      let data;
      try {
        data = JSON.parse(json);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        Alert.alert('Error', 'El archivo no tiene el formato correcto.');
        return;
      }

      console.log('✅ Datos parseados correctamente:', data);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>¡Hola, {name}!</Text>
        <Text style={styles.subtitle}>¿Qué vas a entrenar hoy?</Text>
      </View>

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

      <View style={styles.backupContainer}>
        <TouchableOpacity style={styles.backupButton} onPress={exportData}>
          <Text style={styles.backupButtonText}>Exportar Datos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backupButton} onPress={importData}>
          <Text style={styles.backupButtonText}>Importar Datos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <View style={styles.leftFooter}>
          <TouchableOpacity
            style={styles.timerButton}
            onPress={() => navigation.navigate('TimerScreen')}
          >
            {/* Se muestra solo el símbolo */}
            <Text style={styles.timerButtonText}>⏱</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.configFooterButton}
            onPress={() => navigation.navigate('ConfigurationScreen')}
          >
            <Icon name="settings" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
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
  editButton: {
    backgroundColor: 'blue',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E2E2E2',
  },
  leftFooter: {
    flexDirection: 'row',
  },
  timerButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  configFooterButton: {
    backgroundColor: '#000', // Fondo negro
    padding: 12,
    marginLeft: 10,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
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
  inputContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  label: { fontSize: 18, marginBottom: 8, color: '#333' },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 12,
    borderRadius: 5,
  },
});

