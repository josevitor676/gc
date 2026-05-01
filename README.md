This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Vida Espiritual - Setup rapido

### 1) Variaveis de ambiente

Copie `.env.example` para `.env` e preencha os valores reais.

Variaveis obrigatorias:

- GEMINI_API_KEY
- CRON_SECRET
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING

### 2) Prisma

Gerar client:

```bash
pnpm prisma:generate
```

Criar/aplicar migration local:

```bash
pnpm prisma:migrate --name init_vida_espiritual
```

### 3) Verificacoes locais

```bash
pnpm build
```

### 4) Vercel (producao)

Configure no projeto da Vercel as variaveis:

- GEMINI_API_KEY
- CRON_SECRET
- POSTGRES_URL
- POSTGRES_PRISMA_URL
- POSTGRES_URL_NON_POOLING

O cron diario ja esta definido em `vercel.json` para chamar:

- /api/cron/gerar-devocional

### 5) Seguranca

Se alguma chave foi exposta em historico, anexos ou logs:

1. Rotacione imediatamente as chaves (Gemini e Postgres).
2. Atualize os novos valores em `.env` e na Vercel.
3. Gere um novo `CRON_SECRET` forte e diferente por ambiente.
