import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import RoutineScreen from './src/screens/RoutineScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';
import TimerScreen from './src/screens/TimerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Mis Rutinas' }} 
        />
        <Stack.Screen 
          name="RoutineScreen" 
          component={RoutineScreen} 
          options={{ title: 'Rutina' }} 
        />
        <Stack.Screen 
          name="ExerciseScreen" 
          component={ExerciseScreen} 
          options={{ title: 'Ejercicio' }} 
        />
        {/* Asegúrate de agregar TimerScreen */}
        <Stack.Screen
          name="TimerScreen"
          component={TimerScreen}
          options={{ title: 'Cronómetro' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}