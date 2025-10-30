# 🚀 Sistema de Inscrições - Temporada de Férias

Este é um sistema web completo desenvolvido para gerenciar as inscrições do retiro "Temporada de Férias", um evento da UPA (União Presbiteriana de Adolescentes) da Igreja Presbiteriana de Manaus.

O projeto inclui uma landing page pública, um formulário de inscrição multi-etapas detalhado e um painel administrativo protegido para gerenciamento de participantes, pagamentos e estatísticas do evento.

---

## ✨ Funcionalidades Principais

*   **Página de Inscrição Pública:** Uma landing page moderna com informações sobre o evento, equipe, galeria de fotos e FAQ.
*   **Formulário de Inscrição Multi-etapas:** Um formulário detalhado para coletar informações dos participantes, dados médicos e autorizações dos responsáveis.
*   **Sistema de Pagamento Flexível:** Suporte para PIX (com geração de QR Code dinâmico), carnê parcelado (com opção de pagar a entrada via PIX) e pagamento presencial.
*   **Painel Administrativo:** Uma área restrita para administradores com:
    *   **Dashboard de Estatísticas:** Gráficos e KPIs sobre as inscrições.
    *   **Gerenciamento de Inscrições:** Lista completa de todos os participantes, com filtros, busca e opções de exportação.
    *   **Confirmação de Pagamento:** Ferramentas para registrar e finalizar pagamentos.
    *   **Programa "Adote":** Funcionalidade para marcar participantes que fazem parte do programa de apadrinhamento.
    *   **Q&A:** Módulo para responder dúvidas enviadas pelos usuários.
    *   **Logs de Atividade:** Registro de ações importantes no sistema.
*   **Integração com Google Sheets:** Sincronização automática dos dados de inscrição com uma planilha Google para facilitar o acesso e a colaboração da equipe.
*   **Envio de E-mails Transacionais:** Confirmação de inscrição, de pagamento e respostas a dúvidas são enviadas automaticamente por e-mail usando o serviço **Resend**.

---

## 🛠️ Tecnologias Utilizadas

*   **Front-end:** [React](https://reactjs.org/) com [Next.js](https://nextjs.org/) (App Router) e [TypeScript](https://www.typescriptlang.org/).
*   **Back-end:** [Node.js](https://nodejs.org/) (através do ambiente Next.js) e Server Actions.
*   **Banco de Dados:** [Cloud Firestore](https://firebase.google.com/products/firestore) (Firebase).
*   **Autenticação:** [Firebase Authentication](https://firebase.google.com/products/auth) (para o painel de admin).
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com componentes [ShadCN/UI](https://ui.shadcn.com/).
*   **Envio de E-mails:** [Resend](https://resend.com/).
*   **Planilhas:** [Google Sheets API](https://developers.google.com/sheets).
*   **Sessões de Usuário:** [Iron Session](https://www.npmjs.com/package/iron-session) para gerenciar o login do admin.

---

## 📦 Como Rodar o Projeto Localmente

Siga os passos abaixo para configurar o ambiente de desenvolvimento.

### 1. Pré-requisitos

*   Node.js (versão 18 ou superior)
*   NPM ou Yarn

### 2. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/seu-repositorio.git
cd seu-repositorio
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo chamado `.env.local` na raiz do projeto e adicione as seguintes variáveis. **Estes valores são essenciais para o funcionamento do sistema.**

```env
# Firebase (Cliente) - Obtido no console do Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase (Admin/Servidor) - Credenciais da Service Account
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Segredo para a sessão do admin (gere uma chave segura com 32+ caracteres)
SECRET_COOKIE_PASSWORD=

# Resend API Key - Para envio de e-mails
RESEND_API_KEY=

# Google Sheets API - Credenciais da Service Account e ID da Planilha
GOOGLE_SHEETS_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GOOGLE_SHEETS_DOCUMENT_ID=
```

**Nota:** As credenciais do Firebase Admin e do Google Sheets devem ser tratadas com o máximo de segurança e nunca devem ser expostas no lado do cliente.

### 5. Rode o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver a aplicação em funcionamento.

<!-- Trigger commit -->