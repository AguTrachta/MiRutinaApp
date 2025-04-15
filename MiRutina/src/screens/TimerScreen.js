// src/screens/TimerScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TimerScreen() {
  // Guardaremos el tiempo transcurrido en milisegundos
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(0);       // Guarda el timestamp cuando se inicia
  const accumulatedTimeRef = useRef(0); // Tiempo acumulado cuando se pausa

  // Inicia el cronómetro
  const start = () => {
    if (!isRunning) {
      // Guarda el tiempo de inicio actual
      startTimeRef.current = Date.now();
      setIsRunning(true);
      // Cada 10 ms se actualiza el tiempo real transcurrido
      intervalRef.current = setInterval(() => {
        const delta = Date.now() - startTimeRef.current;
        setTime(accumulatedTimeRef.current + delta);
      }, 10);
    }
  };

  // Pausa el cronómetro y acumula el tiempo transcurrido
  const pause = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      const delta = Date.now() - startTimeRef.current;
      accumulatedTimeRef.current += delta;
      setIsRunning(false);
    }
  };

  // Reinicia el cronómetro a 0
  const reset = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
    accumulatedTimeRef.current = 0;
  };

  // Formatea el tiempo en mm:ss:cc (minutos, segundos, centésimas)
  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centesimas = Math.floor((ms % 1000) / 10);

    const mm = minutes < 10 ? `0${minutes}` : minutes;
    const ss = seconds < 10 ? `0${seconds}` : seconds;
    const cc = centesimas < 10 ? `0${centesimas}` : centesimas;

    return `${mm}:${ss}:${cc}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cronómetro</Text>
      <Text style={styles.timerText}>{formatTime(time)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={start} style={[styles.button, styles.startButton]}>
          <Text style={styles.buttonText}>Iniciar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={pause} style={[styles.button, styles.pauseButton]}>
          <Text style={styles.buttonText}>Pausar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={reset} style={[styles.button, styles.resetButton]}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  startButton: {
    backgroundColor: '#28a745', // verde
  },
  pauseButton: {
    backgroundColor: '#ffc107', // amarillo
  },
  resetButton: {
    backgroundColor: '#dc3545', // rojo
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
