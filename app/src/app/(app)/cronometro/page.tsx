import { createClient } from "@/lib/supabase/server";
import { CronometroApp } from "@/components/cronometro/cronometro-app";
import { CONFIG_POMODORO_PADRAO } from "@/lib/types/cronometro";
import { AvisoSemMaterias } from "@/components/aviso-sem-materias";

export default async function CronometroPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: materias }, { data: lembretes }, { data: perfil }] =
    await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, color")
        .eq("user_id", user?.id ?? "")
        .order("name"),
      supabase
        .from("reminders")
        .select("id, type, message, interval_minutes, enabled")
        .eq("user_id", user?.id ?? "")
        .order("created_at"),
      supabase
        .from("profiles")
        .select("pomodoro_settings")
        .eq("id", user?.id ?? "")
        .maybeSingle(),
    ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cronômetro</h1>
        <p className="text-muted-foreground">
          Cronômetro livre, timer regressivo ou Pomodoro — escolha uma matéria
          e comece a estudar.
        </p>
      </div>

      {(!materias || materias.length === 0) && <AvisoSemMaterias />}

      <CronometroApp
        materias={materias ?? []}
        lembretes={lembretes ?? []}
        configuracaoPomodoro={
          (perfil?.pomodoro_settings as typeof CONFIG_POMODORO_PADRAO | null) ??
          CONFIG_POMODORO_PADRAO
        }
      />
    </div>
  );
}
