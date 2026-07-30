export type Lembrete = {
  id: string;
  type: string;
  message: string;
  interval_minutes: number;
  enabled: boolean;
};

export type ConfigPomodoroDb = {
  estudo_minutos: number;
  pausa_curta_minutos: number;
  pausa_longa_minutos: number;
  ciclos_ate_pausa_longa: number;
};

export const CONFIG_POMODORO_PADRAO: ConfigPomodoroDb = {
  estudo_minutos: 25,
  pausa_curta_minutos: 5,
  pausa_longa_minutos: 15,
  ciclos_ate_pausa_longa: 4,
};
