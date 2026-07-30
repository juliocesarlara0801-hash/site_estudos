import { createClient } from "@/lib/supabase/server";
import { obterMetasComProgresso } from "@/lib/data/metas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NovaMetaForm } from "@/components/metas/nova-meta-form";
import { MetaCard } from "@/components/metas/meta-card";

export default async function MetasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [metas, { data: materias }] = await Promise.all([
    obterMetasComProgresso(supabase, user?.id ?? ""),
    supabase
      .from("subjects")
      .select("id, name, color")
      .eq("user_id", user?.id ?? "")
      .order("name"),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Metas</h1>
        <p className="text-muted-foreground">
          Defina metas de horas de estudo por matéria e acompanhe seu progresso.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova meta</CardTitle>
        </CardHeader>
        <CardContent>
          <NovaMetaForm materias={materias ?? []} />
        </CardContent>
      </Card>

      {metas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma meta cadastrada ainda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metas.map((meta) => (
            <MetaCard key={meta.id} meta={meta} />
          ))}
        </div>
      )}
    </div>
  );
}
