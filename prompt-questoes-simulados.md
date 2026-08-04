# Prompt para o Claude Code — Questões e Simulados

Copie tudo abaixo desta linha e cole no Claude Code:

---

Leia o arquivo prompt.md e os arquivos do projeto existente. O projeto já está completo e deployado na Vercel em https://site-estudos-self.vercel.app.

Quero adicionar uma nova funcionalidade: **Acompanhamento de Questões e Simulados**. Deve ser um novo item na sidebar chamado **"Questões"** com ícone apropriado (ex: `ClipboardCheck` ou `FileQuestion` do lucide-react). Siga as instruções abaixo.

## Visão geral

O usuário precisa registrar e acompanhar seu desempenho em dois tipos de atividade:

1. **Simulados** — provas completas com várias matérias, feitas em datas específicas (ex: simulado ENEM, simulado de concurso, prova da faculdade)
2. **Listas de exercícios** — questões do dia a dia, listas de exercícios de uma matéria específica, questões soltas

O objetivo é ver a **evolução** ao longo do tempo: estou acertando mais? Em quais matérias estou fraco? Como foi meu desempenho comparando simulado atual com o anterior?

## Funcionalidades

### Página principal (/questoes)
- Duas abas no topo: **"Simulados"** e **"Listas de Exercícios"**
- Em cada aba, lista dos registros feitos pelo usuário, ordenados por data (mais recente primeiro)
- Botão de **"Novo Simulado"** e **"Nova Lista"** no topo de cada aba
- Filtros: por matéria, por período de data
- Resumo rápido no topo: total de questões feitas, % de acerto geral, melhor matéria, pior matéria

### Registrar Simulado
Modal ou página dedicada com os campos:
- **Nome do simulado** (ex: "Simulado ENEM 3", "Prova P1 de Cálculo")
- **Data de realização** (date picker, padrão hoje)
- **Descrição/observações** (opcional, texto livre — ex: "Fiz com tempo cronometrado, 4h")
- **Matérias do simulado** — pra cada matéria, o usuário informa:
  - Matéria (select das matérias cadastradas na tabela `subjects`)
  - Quantidade de questões
  - Quantidade de acertos
  - (erros e % calculados automaticamente)
- Botão **"+ Adicionar matéria"** pra incluir mais linhas (um simulado pode ter várias matérias)
- Ao salvar, calcular automaticamente: total de questões, total de acertos, total de erros, % de acerto geral e % por matéria

### Registrar Lista de Exercícios
Modal ou página mais simples:
- **Título** (ex: "Lista 5 de Álgebra Linear", "Questões cap. 7 de Constitucional")
- **Data de realização** (date picker, padrão hoje)
- **Matéria** (select, apenas UMA matéria por lista)
- **Quantidade de questões**
- **Quantidade de acertos**
- **Fonte/origem** (opcional — ex: "Livro do Stewart", "Site QConcursos", "Lista do professor")
- **Observações** (opcional)

### Detalhes do Simulado
Ao clicar num simulado da lista, abrir uma página/modal com:
- Todos os dados do simulado
- **Tabela** com desempenho por matéria (questões, acertos, erros, %)
- **Gráfico de barras** horizontal mostrando % de acerto por matéria (verde >70%, amarelo 50-70%, vermelho <50%)
- **Comparação com simulado anterior**: se existir outro simulado registrado antes desse, mostrar setas ↑↓ indicando se melhorou ou piorou em cada matéria e no geral
- Botões de editar e excluir

### Detalhes da Lista de Exercícios
- Todos os dados da lista
- % de acerto com indicador visual (cor por faixa)
- Comparação com a lista anterior da mesma matéria
- Botões de editar e excluir

### Estatísticas de Questões (nova seção na página /estatisticas existente OU sub-aba dentro de /questoes)
Adicionar uma aba **"Desempenho"** dentro de /questoes com:

**Visão geral:**
- Total de questões respondidas (simulados + listas)
- % de acerto geral
- Matéria com melhor desempenho
- Matéria com pior desempenho

**Gráficos:**
- **Evolução temporal**: gráfico de linha mostrando % de acerto geral por simulado ao longo do tempo (eixo X = data, eixo Y = %)
- **Evolução por matéria**: selecionar uma matéria e ver a linha de evolução de acerto dela ao longo dos simulados/listas
- **Comparativo entre matérias**: gráfico de radar/aranha com % de acerto média por matéria (ótimo pra visualizar pontos fortes e fracos)
- **Distribuição**: gráfico de pizza com total de questões respondidas por matéria
- **Acertos vs Erros por matéria**: gráfico de barras empilhadas

**Metas de acerto:**
- O usuário pode definir uma **meta de % de acerto** por matéria (ex: "Quero acertar 80% de Matemática")
- Mostrar barra de progresso comparando a média atual com a meta
- Indicador visual: atingiu a meta (verde), perto (amarelo), longe (vermelho)

### Integração com o Calendário
- No dia do calendário, mostrar um badge se houve simulado ou lista naquela data
- Na página do dia (`/calendario/[data]`), listar os simulados e listas feitos naquela data com link pro detalhe

## Modelo de dados (Supabase)

```sql
-- Simulados
CREATE TABLE simulados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_wrong INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desempenho por matéria em cada simulado
CREATE TABLE simulado_subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  simulado_id UUID REFERENCES simulados(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  questions INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  wrong INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0
);

-- Listas de exercícios
CREATE TABLE exercise_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  source TEXT,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  wrong INTEGER NOT NULL DEFAULT 0,
  percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Metas de acerto por matéria
CREATE TABLE accuracy_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  target_percentage DECIMAL(5,2) NOT NULL DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, subject_id)
);

-- RLS
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own simulados" ON simulados
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own simulado_subjects" ON simulado_subjects
  FOR ALL USING (
    simulado_id IN (SELECT id FROM simulados WHERE user_id = auth.uid())
  );

CREATE POLICY "Users manage own exercise_lists" ON exercise_lists
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own accuracy_goals" ON accuracy_goals
  FOR ALL USING (auth.uid() = user_id);
```

## Detalhes visuais

- Cores de faixa de desempenho: **verde** (≥70%), **amarelo** (50-69%), **vermelho** (<50%)
- Setas de comparação: **↑ verde** (melhorou), **↓ vermelho** (piorou), **→ cinza** (manteve, variação <2%)
- Cards de resumo no topo estilo dashboard (total questões, % geral, melhor matéria, pior matéria)
- Gráficos usando **recharts** (já instalado no projeto)
- Gráfico de radar pra comparativo entre matérias (recharts tem `RadarChart`)
- Modo escuro funcionando em tudo
- Responsivo (mobile-first)
- Toast de feedback ao salvar/editar/excluir

## Requisitos técnicos

- Seguir o padrão de estilo do projeto (shadcn/ui, Tailwind, modo escuro)
- Cálculos de % e totais feitos no client ao preencher (feedback instantâneo antes de salvar)
- Validação: acertos não pode ser maior que total de questões
- Formulários com react-hook-form + zod (mesmo padrão do projeto)
- Componentes client-side ("use client") onde necessário
- Autosave não é necessário aqui (salvar apenas no submit)

## Etapas

1. **Primeiro**: me passe o SQL final pra criar as tabelas. Espere eu confirmar que rodei no Supabase.
2. **Segundo**: crie a página /questoes com as abas Simulados, Listas de Exercícios e Desempenho
3. **Terceiro**: implemente os formulários de registrar simulado e lista de exercícios
4. **Quarto**: implemente a visualização de detalhes com comparação
5. **Quinto**: implemente os gráficos e metas de acerto na aba Desempenho
6. **Sexto**: integre com o calendário (badges e listagem no dia)
7. **Sétimo**: teste o build (`npm run build`) e faça commit + push pro GitHub

Ao final, me diga tudo que preciso fazer manualmente no Supabase.
