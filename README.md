# Baby Shower — Jéssica & David

Website React/Vite para o baby shower de Jéssica e David, a 16 de outubro de 2026, das 14:30 às 19:30. Inclui confirmações com lista de convites, lista de presentes, reservas privadas e painel administrativo.

## Executar localmente

Requer Node.js 20+ e pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Sem variáveis Supabase, o site público funciona em modo demo. O admin demo só está disponível em desenvolvimento, em `#/admin`, com o utilizador `babyadmin` e qualquer password não vazia.

## Configurar um projeto Supabase vazio

1. Cria um projeto no Supabase.
2. Abre **SQL Editor → New query**.
3. Copia e executa todo o ficheiro `supabase/setup.sql` uma única vez.
4. Em **Authentication → Users**, cria o utilizador administrativo com email e password forte.
5. Copia o UUID do utilizador e executa no SQL Editor:

```sql
insert into public.admin_profiles(user_id,role,display_name)
values ('UUID_DO_UTILIZADOR','admin','babyadmin');
```

6. Em **Project Settings → API**, copia a Project URL e a Publishable key.
7. Preenche `.env.local`:

```env
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_ADMIN_USERNAME=babyadmin
VITE_ADMIN_AUTH_EMAIL=email-do-admin@exemplo.pt
VITE_BASE_PATH=/
```

Nunca coloques a Secret key, `service_role` ou a password do admin num ficheiro do projeto.

## Validar

```bash
pnpm test
pnpm build
pnpm preview
```

Antes de publicar, testa uma confirmação, uma reserva, a gestão da reserva pelo token e todas as páginas do admin.

## GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` compila e publica automaticamente em cada push para `main`.

No repositório `baby-shower-nephew`:

1. Em **Settings → Pages → Build and deployment**, escolhe **GitHub Actions**.
2. Em **Settings → Secrets and variables → Actions → Secrets**, cria:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_ADMIN_AUTH_EMAIL`
3. O username público inicial usa `babyadmin`.
4. Sem domínio próprio, o workflow usa `/baby-shower-nephew/` como base.
5. Para domínio próprio, cria a variável de Actions `VITE_BASE_PATH` com o valor `/`.

## Domínio próprio

Depois do primeiro deploy, configura o domínio em **Settings → Pages → Custom domain**. Quando souberes o domínio final, cria `public/CNAME` contendo apenas esse domínio. Configura depois os registos DNS no fornecedor do domínio e ativa **Enforce HTTPS** quando o certificado estiver disponível.

## Segurança

- O frontend usa apenas a chave pública do Supabase.
- Todas as tabelas têm RLS ativa.
- Confirmações e reservas públicas são criadas por funções controladas.
- A listagem administrativa exige sessão e perfil em `admin_profiles`.
- A base guarda apenas a hash do token privado de gestão de cada reserva.
- Ficheiros `.env*`, builds e dependências estão excluídos do Git.
