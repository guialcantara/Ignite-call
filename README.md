# Ignite Call

Este projeto é uma aplicação de agendamento de chamadas desenvolvida durante a trilha de React do Ignite (Rocketseat).

## Funcionalidades
- Cadastro e login com autenticação via Google (OAuth)
- Integração com Google Calendar
- Definição de intervalos de disponibilidade
- Visualização de agenda e marcação de horários
- Perfil público para agendamento

## Tecnologias Utilizadas
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma ORM](https://www.prisma.io/)
- [MySQL](https://www.mysql.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [React Query](https://react-query.tanstack.com/)
- [Day.js](https://day.js.org/)

## Estrutura do Projeto
- `src/pages`: Páginas da aplicação (rotas Next.js)
- `src/components`: Componentes reutilizáveis
- `src/lib`: Configurações e integrações (Prisma, Google, etc)
- `prisma/`: Migrations e schema do banco de dados
- `public/`: Arquivos estáticos

## Como rodar o projeto

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repo>
   cd Ignite-call
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn
   ```
3. **Configure as variáveis de ambiente:**
   - Renomeie `.env.example` para `.env` (ou crie um novo `.env`)
   - Preencha com suas credenciais do Google e banco de dados
4. **Rode as migrations do banco:**
   ```bash
   npm run prisma:migrate
   ```
5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

Acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação.

## Licença
Este projeto é apenas para fins educacionais.
