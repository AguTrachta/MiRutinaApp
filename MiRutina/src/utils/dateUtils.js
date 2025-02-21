// src/utils/dateUtils.js

/**
 * Devuelve el lunes de la semana de la fecha dada.
 * Si la fecha es domingo (getDay() === 0), se considera que pertenece a la semana que finalizó,
 * por lo que se resta 6 días para obtener el lunes de esa semana.
 */
export function getStartOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // lunes es 1
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Devuelve el rango (inicio y fin) de la semana pasada.
 * Se calcula el lunes de la semana actual y se resta 7 días para obtener el lunes de la semana pasada.
 * El fin de semana pasado se determina como el día anterior al lunes actual, hasta las 23:59:59.999.
 */
export function getLastWeekRange(date = new Date()) {
  const startOfCurrentWeek = getStartOfWeek(date);
  const startOfLastWeek = new Date(startOfCurrentWeek);
  startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);
  
  const endOfLastWeek = new Date(startOfCurrentWeek);
  endOfLastWeek.setDate(startOfCurrentWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);
  
  return {
    start: startOfLastWeek,
    end: endOfLastWeek,
  };
}

/**
 * Filtra un arreglo de sets para devolver solo aquellos que tengan un timestamp
 * dentro del rango [start, end].
 */
export function filterSetsByWeek(sets, start, end) {
  return sets.filter(set => {
    return set.timestamp >= start.getTime() && set.timestamp <= end.getTime();
  });
}

