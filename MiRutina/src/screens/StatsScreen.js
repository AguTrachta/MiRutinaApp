import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import {
  getLastWeekRange,
  getStartOfWeek,
  filterSetsByWeek,
} from '../utils/dateUtils';

export default function StatsScreen({
  isVisible,
  onClose,
  exerciseName,
  exerciseSets = [],
}) {
  // 1) Mejor set histórico (mayor peso, y si empatan en peso, mayor repeticiones)
  const bestSet = useMemo(() => {
    if (!exerciseSets.length) return null;
    
    return exerciseSets.reduce((currentBest, set) => {
      const currentWeight = parseFloat(set.weight) || 0;
      const currentReps   = parseFloat(set.reps)   || 0;

      const bestWeight = parseFloat(currentBest.weight) || 0;
      const bestReps   = parseFloat(currentBest.reps)   || 0;

      // 1) Si el peso actual es mayor, actualizamos bestSet.
      if (currentWeight > bestWeight) {
        return set;
      } 
      // 2) Si el peso es igual, pero las reps son mayores, también actualizamos.
      else if (currentWeight === bestWeight && currentReps > bestReps) {
        return set;
      }
      // 3) En cualquier otro caso, mantenemos el "currentBest".
      return currentBest;
    }, exerciseSets[0]);
  }, [exerciseSets]);

  // 2) Comparación de volumen semana actual vs. semana pasada
  const { start: startOfLastWeek, end: endOfLastWeek } = getLastWeekRange();
  const startOfThisWeek = getStartOfWeek(new Date());
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);
  endOfThisWeek.setHours(23, 59, 59, 999);

  const lastWeekSets = useMemo(() => {
    return filterSetsByWeek(exerciseSets, startOfLastWeek, endOfLastWeek);
  }, [exerciseSets]);

  const thisWeekSets = useMemo(() => {
    return filterSetsByWeek(exerciseSets, startOfThisWeek, endOfThisWeek);
  }, [exerciseSets]);

  const getVolume = (sets) => {
    let total = 0;
    for (const set of sets) {
      const w = parseFloat(set.weight) || 0;
      const r = parseFloat(set.reps) || 0;
      total += w * r;
    }
    return total;
  };

  const lastWeekVolume = getVolume(lastWeekSets);
  const thisWeekVolume = getVolume(thisWeekSets);

  let difference = 0;
  if (lastWeekVolume !== 0) {
    difference = ((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100;
  }

  const getTotals = (sets) => {
    let totalWeight = 0;
    let totalReps = 0;
    sets.forEach((set) => {
      totalWeight += parseFloat(set.weight) || 0;
      totalReps += parseFloat(set.reps) || 0;
    });
    return { totalWeight, totalReps };
  };

  const {
    totalWeight: thisWeekTotalWeight,
    totalReps: thisWeekTotalReps,
  } = getTotals(thisWeekSets);
  const {
    totalWeight: lastWeekTotalWeight,
    totalReps: lastWeekTotalReps,
  } = getTotals(lastWeekSets);

  // 3) Últimos 3 sets (ordenados del más reciente al más antiguo)
  const last3Sets = useMemo(() => {
    const sorted = [...exerciseSets].sort((a, b) => b.timestamp - a.timestamp);
    return sorted.slice(0, 3);
  }, [exerciseSets]);

  // Mensaje según la diferencia de volumen (esta parte queda igual)
  let differenceText = '';
  if (difference > 0) {
    differenceText = `¡Genial! Subiste un ${difference.toFixed(2)}% respecto a la semana pasada.`;
  } else if (difference < 0) {
    differenceText = `Has bajado un ${Math.abs(difference).toFixed(2)}% respecto a la semana pasada. ¡Ánimo!`;
  } else {
    differenceText = `Te mantuviste igual que la semana pasada. ¡Sigue así!`;
  }

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.content}>
        {/* Indicador para arrastrar el modal hacia abajo */}
        <View style={styles.handle} />

        <Text style={styles.title}>Stats for {exerciseName}</Text>

        {/* Tarjeta: Mejor set histórico */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mejor Set Histórico</Text>
          {bestSet ? (
            <Text style={styles.cardText}>
              {bestSet.weight} kg × {bestSet.reps} reps
            </Text>
          ) : (
            <Text style={styles.cardText}>No hay sets todavía</Text>
          )}
        </View>

        {/* Tarjeta: Comparación Semanal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Comparación Semanal</Text>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Semana actual:</Text>{' '}
            {thisWeekTotalWeight.toFixed(2)} kg × {thisWeekTotalReps} reps
          </Text>
          <Text style={styles.cardText}>
            <Text style={styles.bold}>Semana pasada:</Text>{' '}
            {lastWeekTotalWeight.toFixed(2)} kg × {lastWeekTotalReps} reps
          </Text>
          <Text style={[styles.cardText, { marginTop: 5 }]}>{differenceText}</Text>
        </View>

        {/* Tarjeta: Últimos 3 sets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Últimos 3 sets</Text>
          {last3Sets.length > 0 ? (
            last3Sets.map((set, index) => (
              <Text key={set.id} style={styles.cardText}>
                {index + 1}) {set.weight} kg × {set.reps} reps —{' '}
                {new Date(set.timestamp).toLocaleDateString()}
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No hay sets recientes</Text>
          )}
        </View>

        <Text style={styles.motivational}>
          ¡Sigue así y alcanzarás tus objetivos!
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  content: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 800, // Ajusta según tu necesidad
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    width: '90%',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  motivational: {
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    color: '#666',
  },
});

