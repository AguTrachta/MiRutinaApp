import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { getStartOfWeek, getLastWeekRange } from '../utils/dateUtils';

export default function StatsScreen({ isVisible, onClose, exercise }) {
  // Calculamos el lunes de la semana actual y el rango de la semana pasada
  const currentWeekStart = getStartOfWeek(new Date());
  const lastWeekRange = getLastWeekRange(new Date());

  // Si no hay ejercicio, mostramos un mensaje genérico
  if (!exercise) {
    return (
      <Modal
        isVisible={isVisible}
        onSwipeComplete={onClose}
        swipeDirection="down"
        style={styles.modal}
        propagateSwipe
      >
        <View style={styles.content}>
          <View style={styles.handle} />
          <Text style={styles.text}>No hay datos para este ejercicio.</Text>
        </View>
      </Modal>
    );
  }

  // Filtrar los sets según la fecha
  const currentWeekSets = exercise.sets
    ? exercise.sets.filter(set => set.timestamp >= currentWeekStart.getTime())
    : [];
  const lastWeekSets = exercise.sets
    ? exercise.sets.filter(
        set =>
          set.timestamp >= lastWeekRange.start.getTime() &&
          set.timestamp <= lastWeekRange.end.getTime()
      )
    : [];

  // Último set de la semana actual (el de mayor timestamp)
  const lastCurrentWeekSet =
    currentWeekSets.length > 0
      ? currentWeekSets.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
      : null;

  // Último set de la semana pasada
  const lastWeekSet =
    lastWeekSets.length > 0
      ? lastWeekSets.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
      : null;

  // Mejor set histórico (según mayor peso y, en caso de empate, mayor repeticiones)
  const bestHistoricalSet =
    exercise.sets && exercise.sets.length > 0
      ? exercise.sets.reduce((prev, curr) => {
          const prevWeight = parseFloat(prev.weight);
          const currWeight = parseFloat(curr.weight);
          if (currWeight > prevWeight) return curr;
          else if (currWeight === prevWeight) {
            const prevReps = parseFloat(prev.reps);
            const currReps = parseFloat(curr.reps);
            return currReps > prevReps ? curr : prev;
          } else return prev;
        })
      : null;

  return (
    <Modal
      isVisible={isVisible}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe
    >
      <View style={styles.content}>
        <View style={styles.handle} />
        <Text style={styles.title}>Estadísticas para {exercise.name}</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Último set de esta semana:</Text>
          {lastCurrentWeekSet ? (
            <Text style={styles.sectionText}>
              Reps: {lastCurrentWeekSet.reps}, Peso: {lastCurrentWeekSet.weight}
            </Text>
          ) : (
            <Text style={styles.sectionText}>
              Listo para superar el set de la semana pasada? 
            </Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Último set de la semana pasada:</Text>
          {lastWeekSet ? (
            <Text style={styles.sectionText}>
              Reps: {lastWeekSet.reps}, Peso: {lastWeekSet.weight}
            </Text>
          ) : (
            <Text style={styles.sectionText}>
              No hay datos de la semana pasada.
            </Text>
          )}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mejor set histórico:</Text>
          {bestHistoricalSet ? (
            <Text style={styles.sectionText}>
              Reps: {bestHistoricalSet.reps}, Peso: {bestHistoricalSet.weight}
            </Text>
          ) : (
            <Text style={styles.sectionText}>No hay datos históricos.</Text>
          )}
        </View>
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
    height: 800, // Puedes ajustar esta altura según lo que necesites
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
    marginBottom: 20,
  },
  section: {
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 16,
  },
  text: {
    fontSize: 20,
  },
});

