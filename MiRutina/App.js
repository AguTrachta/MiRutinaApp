// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa las pantallas
import HomeScreen from './src/screens/HomeScreen';
import RoutineScreen from './src/screens/RoutineScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Mi Rutina' }} 
        />
        <Stack.Screen 
          name="RoutineScreen" 
          component={RoutineScreen} 
          options={{ title: 'Rutina' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
