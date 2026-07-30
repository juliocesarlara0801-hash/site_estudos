import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PerfilForm } from "@/components/configuracoes/perfil-form";
import { Materias } from "@/components/configuracoes/materias";
import { PomodoroForm } from "@/components/configuracoes/pomodoro-form";
import { Lembretes } from "@/components/configuracoes/lembretes";
import { CONFIG_POMODORO_PADRAO } from "@/lib/types/cronometro";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: perfil }, { data: materias }, { data: lembretes }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, pomodoro_settings")
        .eq("id", user?.id ?? "")
        .maybeSingle(),
      supabase
        .from("subjects")
        .select("id, name, color")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: true }),
      supabase
        .from("reminders")
        .select("id, type, message, interval_minutes, enabled")
        .eq("user_id", user?.id ?? "")
        .order("created_at", { ascending: true }),
    ]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie seu perfil, suas matérias e preferências.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>
            E-mail: {user?.email}. O tema (claro/escuro) pode ser trocado pelo
            menu do seu usuário na barra lateral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PerfilForm nomeAtual={perfil?.display_name ?? null} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matérias</CardTitle>
          <CardDescription>
            Cadastre as matérias que você estuda. Elas serão usadas no
            calendário, cronômetro, metas e flashcards.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Materias materias={materias ?? []} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pomodoro</CardTitle>
          <CardDescription>
            Duração padrão de cada fase do modo Pomodoro no Cronômetro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PomodoroForm
            configuracaoAtual={
              (perfil?.pomodoro_settings as typeof CONFIG_POMODORO_PADRAO | null) ??
              CONFIG_POMODORO_PADRAO
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lembretes</CardTitle>
          <CardDescription>
            Avisos que aparecem durante uma sessão de estudo em andamento
            (água, alongamento, regra 20-20-20, etc).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Lembretes lembretes={lembretes ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
