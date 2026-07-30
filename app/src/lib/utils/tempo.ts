export function formatarHMS(segundosTotais: number) {
  const s = Math.max(0, Math.floor(segundosTotais));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(sec).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Ex: 5400 -> "1h 30min"; 1800 -> "30min"; 0 -> "0min" */
export function formatarHorasMinutos(segundosTotais: number) {
  const s = Math.max(0, Math.round(segundosTotais));
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function segundosParaHoras(segundos: number) {
  return Math.round((segundos / 3600) * 100) / 100;
}
