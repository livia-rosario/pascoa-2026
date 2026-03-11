# Zuca Confeitaria – Páscoa 2026

## Como fazer o deploy

### 1. Instalar dependências
```bash
npm install
```

### 2. Criar projeto no Convex
```bash
npx convex dev
```
Isso vai pedir login no Convex e cria tudo automaticamente.
Gera a pasta `convex/_generated/` e o `.env.local` com a URL.

### 3. Deploy no Vercel

#### Via GitHub (recomendado)
1. Sobe o projeto no GitHub
2. vercel.com → "New Project" → importa o repositório
3. Em "Environment Variables" adiciona:
   - `VITE_CONVEX_URL` = URL do seu projeto Convex (ex: https://xxx.convex.cloud)
4. Clica em Deploy

#### Via CLI
```bash
npx vercel
```

### Credenciais de acesso
- Usuário: `zuca`
- Senha: `pascoa2026`
