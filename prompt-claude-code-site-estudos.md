# Prompt para o Claude Code — Site de Estudos

Copie tudo abaixo desta linha e cole no Claude Code:

---

Quero que você me ajude a construir, do zero, um **site de estudos personalizado** com login de múltiplos usuários, publicado online para qualquer pessoa acessar. Vamos trabalhar de forma iterativa: **primeiro planeje a arquitetura, depois construa em fases, e só passe pra próxima fase depois que eu aprovar a anterior.**

## Stack técnica

- **Framework:** Next.js 14+ (App Router) com TypeScript
- **Estilização:** Tailwind CSS + shadcn/ui para componentes
- **Autenticação e banco de dados:** Supabase (Auth + PostgreSQL + Row Level Security)
- **Deploy:** Vercel, conectado ao GitHub para deploy automático
- **Bibliotecas complementares sugeridas:** 
  - `date-fns` para manipulação de datas
  - `recharts` para gráficos
  - `react-hook-form` + `zod` para formulários e validação
  - `@react-pdf/renderer` ou `jspdf` para exportar PDF
  - `lucide-react` para ícones

## Estrutura geral do site

Layout com **sidebar de navegação** (colapsável no mobile) contendo os menus:

1. **Dashboard** (visão geral do dia)
2. **Calendário** (visão mensal/semanal com anotações)
3. **Cronômetro / Pomodoro**
4. **Estatísticas**
5. **Metas**
6. **Flashcards**
7. **Configurações**

Deve ter suporte a **modo escuro** com toggle salvo por usuário, layout responsivo (mobile-first) e ser acessível.

## Funcionalidades detalhadas

### 1. Autenticação
- Login/cadastro com e-mail e senha
- Login com Google (opcional, via Supabase Auth)
- Recuperação de senha
- Cada usuário só vê seus próprios dados (usar Row Level Security no Supabase)

### 2. Calendário
- Visão mensal com marcadores nos dias que têm anotações
- Ao **clicar num dia**, abre a visualização detalhada daquele dia (modal ou página dedicada), contendo:
  - **Cronograma / horário do dia** (blocos de tempo por matéria, editáveis)
  - **Anotações do dia** (editor de texto rico, com suporte a negrito, itálico, listas)
  - **Conclusões do dia** (o que aprendi)
  - **Dúvidas do dia** (lista de perguntas em aberto)
  - **Pendências** (o que ficou faltando)
  - **Concluído** (o que consegui completar, checklist)
- Cada bloco salva automaticamente (autosave com debounce)
- Também permitir **visão semanal** como alternativa

### 3. Cronômetro / Pomodoro
- **Cronômetro livre**: começa em zero, roda até eu parar, salva o tempo associado a uma matéria selecionada
- **Timer regressivo**: eu defino o tempo (ex: 45 min de matemática) e ele conta pra trás
- **Modo Pomodoro**: configurável (padrão 25 min estudo / 5 min pausa / a cada 4 ciclos, pausa longa de 15 min)
- Notificação sonora e visual ao fim de cada ciclo
- **Lembretes customizáveis** durante o estudo (a cada X minutos): beber água, comer algo, alongar, olhar longe da tela (regra 20-20-20)
- Ao encerrar uma sessão, o tempo é salvo no histórico associado à matéria

### 4. Estatísticas
- Gráfico de barras: **tempo estudado por matéria** na semana/mês
- Gráfico de linha: **tempo total de estudo por dia** (últimos 30 dias)
- Total de horas na semana, mês e desde o início
- Comparativo com semana anterior
- Filtros por período e por matéria

### 5. Metas
- Criar metas por matéria com meta semanal/mensal de horas
- **Barra de progresso** visual pra cada meta
- Notificação quando atingir a meta
- Histórico de metas cumpridas

### 6. Flashcards
- Criar decks por matéria
- Cada flashcard tem frente (pergunta) e verso (resposta)
- Modo revisão com **repetição espaçada simples** (algoritmo tipo SM-2 simplificado): cartão marcado como "difícil" volta em 1 dia, "médio" em 3 dias, "fácil" em 7 dias
- Estatística de acerto por deck

### 7. Exportar PDF
- No calendário, botão pra **exportar o dia** ou **a semana** em PDF (cronograma + anotações + conclusões + dúvidas)
- Exportar decks de flashcards em PDF pra estudar offline

### 8. Configurações
- Nome de exibição, avatar
- Toggle modo escuro
- Preferências do Pomodoro (durações padrão)
- Lista de matérias cadastradas (CRUD)
- Preferências de lembrete (frequência, sons)

## Modelo de dados (Supabase)

Crie as tabelas com Row Level Security ativado. Estrutura sugerida:

- `profiles` (id, user_id, display_name, avatar_url, dark_mode, pomodoro_settings jsonb)
- `subjects` (id, user_id, name, color)
- `day_entries` (id, user_id, date, schedule jsonb, notes text, conclusions text, doubts text, pending text, completed jsonb)
- `study_sessions` (id, user_id, subject_id, started_at, ended_at, duration_seconds, type: 'free'|'timer'|'pomodoro')
- `goals` (id, user_id, subject_id, target_hours, period: 'weekly'|'monthly', created_at)
- `flashcard_decks` (id, user_id, subject_id, name)
- `flashcards` (id, deck_id, front, back, next_review_at, difficulty_level)
- `reminders` (id, user_id, type, message, interval_minutes, enabled)

## Como trabalhar (importante)

1. **Fase 1 — Planejamento:** apresente a estrutura de pastas, o esquema completo do banco (com SQL das tabelas e políticas RLS) e explique as decisões antes de codar. **Espere minha aprovação.**
2. **Fase 2 — Setup inicial:** projeto Next.js, Tailwind, shadcn/ui, integração com Supabase, autenticação funcionando, layout base com sidebar e modo escuro. **Espere minha aprovação.**
3. **Fase 3 — Calendário e anotações do dia** (feature central).
4. **Fase 4 — Cronômetro, timer e Pomodoro com lembretes.**
5. **Fase 5 — Estatísticas e Metas.**
6. **Fase 6 — Flashcards.**
7. **Fase 7 — Exportar PDF e polimento.**
8. **Fase 8 — Deploy na Vercel** com passo a passo (variáveis de ambiente, conexão com Supabase, GitHub).

Ao fim de cada fase: explique o que foi feito, como testar localmente e o que precisa ser configurado (chaves, variáveis de ambiente, etc.).

## Preferências de código

- Componentes pequenos e reutilizáveis
- Server Components onde fizer sentido, Client Components quando precisar de interatividade
- Comentários explicativos nos trechos mais complexos (sou iniciante em algumas partes)
- Nomes de variáveis, comentários e mensagens da UI em **português**
- Tratamento de erros com feedback visual (toast)

## Antes de começar

Confirme que entendeu o escopo, aponte qualquer ponto que ache que deva ser simplificado ou repensado, e me passe a lista de coisas que preciso ter pronto antes (conta no Supabase, no GitHub, na Vercel, chaves de API, etc.). Depois, comece pela **Fase 1**.
