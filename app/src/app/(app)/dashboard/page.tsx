import Link from "next/link";
import {
  CalendarDays,
  Timer,
  BarChart3,
  Target,
  Layers,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ATALHOS = [
  {
    titulo: "Calendário",
    descricao: "Veja o cronograma e as anotações do dia",
    url: "/calendario",
    icone: CalendarDays,
  },
  {
    titulo: "Cronômetro",
    descricao: "Inicie uma sessão de estudo ou Pomodoro",
    url: "/cronometro",
    icone: Timer,
  },
  {
    titulo: "Estatísticas",
    descricao: "Acompanhe seu tempo de estudo",
    url: "/estatisticas",
    icone: BarChart3,
  },
  {
    titulo: "Metas",
    descricao: "Confira o progresso das suas metas",
    url: "/metas",
    icone: Target,
  },
  {
    titulo: "Flashcards",
    descricao: "Revise seus decks de flashcards",
    url: "/flashcards",
    icone: Layers,
  },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const primeiroNome = perfil?.display_name?.split(" ")[0];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá{primeiroNome ? `, ${primeiroNome}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Este é o seu painel de estudos. Escolha por onde começar.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ATALHOS.map((atalho) => (
          <Link key={atalho.url} href={atalho.url}>
            <Card className="h-full transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <atalho.icone className="size-5 text-primary" />
                </div>
                <CardTitle>{atalho.titulo}</CardTitle>
                <CardDescription>{atalho.descricao}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
