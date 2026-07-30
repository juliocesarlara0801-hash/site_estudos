// Bipe gerado via Web Audio API, sem depender de um arquivo de áudio.
export function tocarBipe() {
  if (typeof window === "undefined") return;

  const AudioContextClasse =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClasse) return;

  const contexto = new AudioContextClasse();
  const osc = contexto.createOscillator();
  const ganho = contexto.createGain();
  osc.connect(ganho);
  ganho.connect(contexto.destination);
  osc.frequency.value = 880;
  ganho.gain.setValueAtTime(0.15, contexto.currentTime);
  osc.start();
  ganho.gain.exponentialRampToValueAtTime(0.0001, contexto.currentTime + 0.4);
  osc.stop(contexto.currentTime + 0.4);
  osc.onended = () => contexto.close();
}
