# MarsLink — Plataforma Web + API REST + App Mobile para Missões em Marte

Projeto desenvolvido para a **Global Solution | Indústria Espacial — FIAP · 2º Semestre de 2026**.

O **MarsLink** é uma solução digital full stack criada para simular uma plataforma de comunicação, coordenação e monitoramento em uma missão humana a Marte, considerando um cenário de **latência extrema**, comunicação instável e necessidade de decisões operacionais assíncronas.

A solução final foi estruturada como um ecossistema integrado composto por:

- **App Mobile da Tripulação**, desenvolvido em React Native/Expo;
- **Dashboard Web do Controle Terra**, desenvolvido em Next.js;
- **API REST própria**, desenvolvida com Node.js e Express;
- **Banco de dados PostgreSQL**, hospedado no Neon;
- **ORM Prisma**, com migrations e seed;
- **Autenticação JWT**, com perfis `CREW` e `CONTROL`;
- **Upload de imagens com Vercel Blob**;
- **Deploy do Backend na Vercel**;
- **Deploy do Web na Vercel**;
- **Build Android via Expo/EAS Build**.

---

## Links da Entrega

| Item | Link |
|---|---|
| Plataforma Web / Controle Terra | https://marslink-web.vercel.app/ |
| API REST base | https://marslink-backend.vercel.app/ |
| Repositório GitHub | https://github.com/pateihara/marslink |
| Deploy Backend — Vercel | https://vercel.com/pateiharas-projects/marslink-backend |
| Deploy Web — Vercel | https://vercel.com/pateiharas-projects/marslink-web |
| Mobile Android / APK — EAS Build | https://expo.dev/accounts/eiharap/projects/mobile/builds/13cd2080-cbe4-4993-9b01-7cf4799a5457 |
| Vídeo Pitch | https://youtube.com/shorts/z88dgkPlDM8 |

---

## Usuários de Demonstração

### Controle Terra / Web

```txt
E-mail: controle@marslink.com
Código da missão: ARES2026
Senha: 123456
Perfil: CONTROL
```

### Tripulação / Mobile

```txt
E-mail: silva@marslink.com
Código da missão: ARES2026
Senha: 123456
Perfil: CREW
```

---

## Sobre o Projeto

O desafio propõe a criação de uma plataforma de comunicação e coordenação para uma tripulação de quatro pessoas na primeira missão humana a Marte.

Nesse cenário, o sinal entre Marte e Terra pode levar entre **3 e 22 minutos** para chegar, dependendo da posição dos planetas. Por isso, não existe comunicação em tempo real, chamada de vídeo instantânea ou suporte imediato.

O **MarsLink** foi criado para resolver esse problema através de uma arquitetura pensada para:

- comunicação assíncrona;
- fila de mensagens;
- confirmação de recebimento e leitura;
- gestão de tarefas operacionais;
- registro de decisões da missão;
- monitoramento da tripulação;
- anexos visuais em tarefas;
- logs visuais da missão;
- integração entre app mobile, dashboard web, backend e banco de dados.

A proposta segue a ideia:

> **Projetada para Marte. Aplicável na Terra.**

A mesma arquitetura usada para uma missão espacial pode ser adaptada para cenários terrestres com baixa conectividade, como zonas de desastre, comunidades remotas, operações humanitárias e regiões sem infraestrutura de rede confiável.

---

## Objetivo da Global Solution

O projeto atende ao desafio da **Global Solution | Indústria Espacial**, cujo objetivo é construir uma solução integrada com:

- app mobile;
- interface web;
- backend funcional;
- API REST;
- banco de dados;
- autenticação;
- histórico de mensagens;
- status da missão;
- gestão de tarefas;
- deploy completo;
- alinhamento com pelo menos um ODS da ONU.

O MarsLink entrega uma plataforma navegável, funcional e tecnicamente coerente com o contexto marciano proposto.

---

## Alinhamento com ODS da ONU

### ODS Principal — ODS 9: Indústria, Inovação e Infraestrutura

O MarsLink se conecta diretamente ao **ODS 9**, pois propõe uma infraestrutura digital resiliente para comunicação em ambientes extremos. A solução utiliza backend próprio, API REST, banco de dados em nuvem, autenticação, armazenamento de imagens e integração entre plataformas.

A proposta demonstra como tecnologias digitais podem apoiar sistemas críticos em cenários onde a infraestrutura tradicional de comunicação falha.

### ODS Complementar — ODS 11: Cidades e Comunidades Sustentáveis

A solução também se conecta ao **ODS 11**, pois a mesma arquitetura pensada para Marte pode ser aplicada em comunidades remotas, áreas isoladas, regiões atingidas por desastres naturais e operações humanitárias.

Nesses contextos, a comunicação tradicional pode estar indisponível, tornando útil uma plataforma capaz de operar com mensagens assíncronas, registros visuais, tarefas e histórico de decisões.

### ODS de Apoio — ODS 13: Ação Contra a Mudança Global do Clima

Embora não seja o foco principal, o MarsLink também pode apoiar o **ODS 13** ao permitir o envio de registros visuais e relatórios operacionais que poderiam ser usados em situações de enchentes, incêndios, deslizamentos, monitoramento ambiental e eventos climáticos extremos.

---

## Arquitetura da Solução

```txt
MarsLink
│
├── backend
│   ├── API REST em Node.js + Express
│   ├── Autenticação JWT
│   ├── Prisma ORM
│   ├── PostgreSQL Neon
│   ├── Upload de imagens com Vercel Blob
│   └── Deploy Vercel
│
├── web
│   ├── Dashboard Controle Terra
│   ├── Next.js
│   ├── React
│   ├── TypeScript
│   ├── CSS global
│   └── Deploy Vercel
│
└── mobile
    ├── App da Tripulação
    ├── React Native
    ├── Expo
    ├── Expo Image Picker
    ├── TypeScript
    └── Build Android via EAS
```

---

## Fluxo Geral da Aplicação

```txt
Tripulação / App Mobile
        │
        │ Mensagens, tarefas, logs e imagens
        ▼
Backend API REST
        │
        ├── PostgreSQL / Neon
        │       └── usuários, missão, mensagens, tarefas, logs e sinais vitais
        │
        └── Vercel Blob
                └── imagens de registros visuais e evidências de tarefas

Controle Terra / Dashboard Web
        │
        └── acompanha missão, comunicação, tarefas, imagens e tripulação
```

---

## Tecnologias Utilizadas

### Backend / API

- Node.js;
- Express;
- Prisma ORM;
- PostgreSQL;
- Neon;
- JWT;
- Bcrypt;
- Multer;
- Vercel Blob;
- CORS;
- Dotenv;
- Deploy na Vercel.

### Web / Controle Terra

- Next.js;
- React;
- TypeScript;
- CSS Global;
- LocalStorage para sessão;
- Consumo da API REST;
- Deploy na Vercel.

### Mobile / Tripulação

- React Native;
- Expo;
- Expo Router;
- TypeScript;
- Expo Image Picker;
- EAS Build;
- Consumo da API REST;
- Upload de imagens para o backend.

### Banco de Dados e Storage

- PostgreSQL;
- Neon;
- Prisma Migrate;
- Prisma Studio;
- Vercel Blob.

---

## Funcionalidades da Plataforma Web / Controle Terra

### Autenticação

- Login com e-mail, senha e código da missão;
- Geração de token JWT;
- Proteção por perfil `CONTROL`;
- Bloqueio de acesso para usuários da tripulação no dashboard web.

### Visão Geral da Missão

O dashboard web exibe uma visão consolidada da missão:

- nome da missão;
- dia atual da missão;
- fase da missão;
- status da janela de comunicação;
- atraso atual de comunicação;
- qualidade do sinal;
- mensagens na fila;
- tarefas pendentes;
- registros visuais enviados;
- últimas comunicações;
- últimos logs da missão;
- tripulação e sinais vitais simulados.

### Comunicações

O Controle Terra pode:

- visualizar mensagens enviadas pela tripulação;
- enviar instruções para a tripulação;
- acompanhar prioridade da mensagem;
- visualizar atraso estimado;
- atualizar o status da mensagem;
- acompanhar histórico de comunicação.

Status exibidos em português:

| Status técnico | Status na interface |
|---|---|
| `CREATED` | CRIADA |
| `QUEUED` | NA FILA |
| `SENT` | TRANSMITIDA |
| `DELIVERED` | RECEBIDA |
| `ACKNOWLEDGED` | LIDA |

### Tripulação

A aba de tripulação exibe:

- nome dos tripulantes;
- e-mail;
- avatar operacional;
- frequência cardíaca simulada;
- oxigenação simulada;
- temperatura corporal simulada;
- nível de estresse simulado;
- tarefas atribuídas.

### Tarefas

O Controle Terra pode:

- criar tarefas para a missão;
- definir prioridade;
- atribuir responsável;
- acompanhar status;
- visualizar evidência visual anexada pela tripulação;
- abrir imagem da evidência em tamanho original.

A alteração de status foi concentrada no app mobile, pois a tripulação é quem executa a tarefa em campo.

### Logs da Missão

O dashboard permite:

- criar logs operacionais;
- visualizar logs criados pela tripulação;
- acompanhar estado emocional associado;
- visualizar registros visuais enviados pelo mobile;
- abrir imagens em tamanho original.

---

## Funcionalidades do App Mobile / Tripulação

### Login da Tripulação

O app mobile permite login com:

- e-mail;
- senha;
- código da missão.

Apenas usuários com perfil `CREW` podem acessar o app mobile.

### Home da Missão

A tela inicial do app apresenta:

- saudação ao tripulante;
- fase da missão;
- tarefas pendentes;
- janela de comunicação;
- atraso atual;
- mensagens na fila;
- última mensagem;
- próxima tarefa;
- último registro visual.

### Comunicações

A tripulação pode:

- enviar mensagens ao Controle Terra;
- visualizar histórico de mensagens;
- acompanhar status das mensagens;
- visualizar atraso estimado.

As mensagens são criadas com status inicial de fila, simulando a comunicação assíncrona entre Marte e Terra.

### Tarefas

A tripulação pode:

- visualizar tarefas do turno;
- marcar tarefa como **Pendente**;
- marcar tarefa como **Em andamento**;
- marcar tarefa como **Concluída**;
- anexar uma evidência visual;
- trocar a evidência visual;
- remover a evidência visual.

Cada tarefa aceita **uma única imagem de evidência**.

Essa regra foi adotada para manter o fluxo simples, objetivo e coerente com o MVP:

```txt
1 tarefa = até 1 evidência visual
```

### Registro Visual da Missão

O app mobile permite criar registros visuais da missão com:

- título;
- descrição;
- estado emocional;
- uma imagem opcional.

Cada log aceita **uma única imagem**:

```txt
1 log da missão = até 1 imagem
```

Essas imagens são enviadas para o backend, armazenadas no Vercel Blob e exibidas no dashboard web do Controle Terra.

---

## Modelo de Dados

O banco foi modelado com Prisma e PostgreSQL.

### Principais entidades

- `User`
- `Mission`
- `Message`
- `MessageStatusHistory`
- `Task`
- `MissionLog`
- `Vital`
- `CommunicationWindow`

### Perfis de usuário

```prisma
enum UserRole {
  CREW
  CONTROL
}
```

### Status das mensagens

```prisma
enum MessageStatus {
  CREATED
  QUEUED
  SENT
  DELIVERED
  ACKNOWLEDGED
}
```

### Prioridade das mensagens

```prisma
enum MessagePriority {
  LOW
  NORMAL
  HIGH
  CRITICAL
}
```

### Status das tarefas

```prisma
enum TaskStatus {
  PENDING
  IN_PROGRESS
  DONE
  CANCELLED
}
```

### Prioridade das tarefas

```prisma
enum TaskPriority {
  LOW
  NORMAL
  HIGH
  CRITICAL
}
```

### Estado emocional dos logs

```prisma
enum LogMood {
  CALM
  FOCUSED
  TIRED
  STRESSED
  ALERT
}
```

---

## Principais Rotas da API

### Autenticação

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/login` | Realiza login e retorna token JWT |

### Mensagens

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/messages` | Lista mensagens da missão |
| POST | `/api/messages` | Cria nova mensagem |
| PATCH | `/api/messages/:id/status` | Atualiza status da mensagem |

### Tarefas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/tasks` | Lista tarefas da missão |
| POST | `/api/tasks` | Cria nova tarefa |
| PATCH | `/api/tasks/:id` | Atualiza tarefa, status ou evidência visual |

### Logs da Missão

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/logs` | Lista logs da missão |
| POST | `/api/logs` | Cria novo log da missão |

### Upload de Imagens

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/upload/mission-image` | Envia imagem para o Vercel Blob |

### Tripulação

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/crew` | Lista tripulantes da missão |

### Sinais Vitais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/vitals` | Lista dados simulados de sinais vitais |

### Janelas de Comunicação

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/windows/current` | Retorna a janela atual de comunicação |

---

## Estrutura do Projeto

```txt
MARS-LINK/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.js
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── crew.routes.js
│   │   │   ├── logs.routes.js
│   │   │   ├── messages.routes.js
│   │   │   ├── tasks.routes.js
│   │   │   ├── upload.routes.js
│   │   │   ├── vitals.routes.js
│   │   │   └── windows.routes.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   ├── prisma.config.ts
│   └── vercel.json
│
├── web/
│   ├── src/
│   │   └── app/
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   │
│   ├── .env.local
│   ├── package.json
│   └── README.md
│
└── mobile/
    ├── app/
    │   ├── _layout.tsx
    │   └── index.tsx
    │
    ├── src/
    │   ├── services/
    │   │   └── api.ts
    │   │
    │   ├── theme/
    │   │   └── colors.ts
    │   │
    │   └── types/
    │       └── api.ts
    │
    ├── app.json
    ├── eas.json
    └── package.json
```

---

## Variáveis de Ambiente — Backend

Crie um arquivo `.env` dentro da pasta `backend`:

```env
DATABASE_URL="postgresql://usuario:senha@host.neon.tech/neondb?sslmode=require"
JWT_SECRET="sua_chave_secreta"
BLOB_READ_WRITE_TOKEN="seu_token_do_vercel_blob"
PORT=3333
```

### Observação sobre segurança

O token do Vercel Blob deve ficar **somente no backend**.

Ele não deve ser colocado no mobile nem no frontend web.

---

## Variáveis de Ambiente — Web

Crie um arquivo `.env.local` dentro da pasta `web`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
```

Para usar a API publicada:

```env
NEXT_PUBLIC_API_URL=https://marslink-backend.vercel.app
```

---

## Como Rodar o Backend Localmente

Acesse a pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Execute as migrations:

```bash
npx prisma migrate dev
```

Gere o Prisma Client:

```bash
npx prisma generate
```

Execute o seed:

```bash
npm run prisma:seed
```

Inicie o servidor:

```bash
npm run dev
```

A API ficará disponível em:

```txt
http://localhost:3333
```

---

## Como Rodar o Web Localmente

Acesse a pasta do web:

```bash
cd web
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

---

## Como Rodar o Mobile Localmente

Acesse a pasta do mobile:

```bash
cd mobile
```

Instale as dependências:

```bash
npm install
```

Execute o app:

```bash
npx expo start --clear
```

Para abrir no navegador:

```txt
w
```

Para testar no Expo Go, escaneie o QR Code gerado pelo terminal.

---

## Como Gerar o APK Android

Acesse a pasta do mobile:

```bash
cd mobile
```

Execute o build de preview:

```bash
eas build --profile preview --platform android
```

O build gera um APK de distribuição interna, que pode ser instalado em um dispositivo Android para demonstração.

---

## Scripts Úteis — Backend

```bash
npm run dev
```

Executa o backend em ambiente local.

```bash
npm run build
```

Gera o Prisma Client.

```bash
npm run prisma:seed
```

Executa o seed de dados demonstrativos.

```bash
npx prisma migrate dev
```

Cria e aplica migrations em ambiente local.

```bash
npx prisma generate
```

Gera o Prisma Client.

```bash
npx prisma studio
```

Abre o Prisma Studio para visualizar o banco.

---

## Scripts Úteis — Web

```bash
npm run dev
```

Executa o ambiente de desenvolvimento.

```bash
npm run build
```

Gera a build de produção.

```bash
npm start
```

Executa a versão de produção localmente.

---

## Scripts Úteis — Mobile

```bash
npx expo start --clear
```

Inicia o app limpando cache.

```bash
eas build --profile preview --platform android
```

Gera build Android em APK.

```bash
eas login
```

Realiza login no EAS.

```bash
eas whoami
```

Verifica o usuário logado no EAS.

---

## Deploy

### Backend

O backend foi publicado na Vercel:

```txt
https://marslink-backend.vercel.app
```

Configurações principais:

```txt
Root Directory: backend
Framework Preset: Other
Build Command: npm run build
Install Command: npm install
```

Variáveis necessárias na Vercel:

```env
DATABASE_URL="sua_url_do_neon"
JWT_SECRET="sua_chave_secreta"
BLOB_READ_WRITE_TOKEN="seu_token_do_vercel_blob"
```

### Web

O dashboard web foi publicado na Vercel:

```txt
https://marslink-web.vercel.app/
```

Configurações principais:

```txt
Root Directory: web
Framework Preset: Next.js
Build Command: npm run build
Install Command: npm install
```

Variáveis necessárias na Vercel:

```env
NEXT_PUBLIC_API_URL=https://marslink-backend.vercel.app
```

### Mobile

O app mobile foi gerado com Expo/EAS Build:

```txt
https://expo.dev/accounts/eiharap/projects/mobile/builds/13cd2080-cbe4-4993-9b01-7cf4799a5457
```

Profile utilizado:

```txt
preview
```

Plataforma:

```txt
android
```

Formato:

```txt
APK
```

---

## Dados de Demonstração

O seed cria dados para testar a aplicação, incluindo:

- missão Ares-1;
- usuário do Controle Terra;
- tripulantes;
- mensagens iniciais;
- tarefas operacionais;
- sinais vitais simulados;
- janela de comunicação;
- logs da missão.

Esses dados são persistidos no PostgreSQL/Neon e consumidos pela API.

---

## Identidade Visual

| Token | Valor | Uso |
|---|---|---|
| orange | `#FC6E20` | Ação principal, destaque e elementos críticos |
| cream | `#FFE7D0` | Destaques secundários |
| bg | `#181818` | Fundo principal |
| surface | `#202020` | Superfícies e áreas de apoio |
| card | `#272727` | Cards e blocos internos |
| card2 | `#2E2E2E` | Variação de cards |
| text | `#EEEAE4` | Texto principal |
| sub | `#8A8680` | Texto secundário |
| success | `#4BB87A` | Estados concluídos ou positivos |
| warn | `#E8A020` | Alertas e atenção |
| danger | `#D04030` | Erros ou estados críticos |

---

## Testes Realizados

### Backend/API

- Login do Controle Terra;
- Login da tripulação;
- Validação de JWT;
- Bloqueio por perfil;
- Listagem de mensagens;
- Criação de mensagem;
- Atualização de status de mensagem;
- Listagem de tarefas;
- Criação de tarefas;
- Atualização de status de tarefas;
- Upload de imagem para Vercel Blob;
- Salvamento de imagem em tarefa;
- Criação de log com imagem;
- Listagem de tripulação;
- Listagem de sinais vitais;
- Consulta de janela de comunicação;
- Deploy na Vercel.

### Web

- Login com perfil CONTROL;
- Bloqueio de acesso para perfil CREW;
- Carregamento da visão geral;
- Exibição de mensagens;
- Atualização de status das mensagens;
- Criação de tarefas;
- Exibição de tarefas com status atualizado pelo mobile;
- Exibição de evidência visual em tarefa;
- Abertura de imagem em tamanho original;
- Visualização de tripulação;
- Visualização de sinais vitais;
- Criação de logs;
- Exibição de logs visuais;
- Deploy na Vercel.

### Mobile

- Login com perfil CREW;
- Bloqueio de acesso para perfil CONTROL;
- Visualização da Home;
- Envio de mensagem para Controle Terra;
- Listagem de tarefas;
- Alteração de tarefa para Pendente;
- Alteração de tarefa para Em andamento;
- Alteração de tarefa para Concluída;
- Upload de evidência visual em tarefa;
- Troca de evidência visual;
- Remoção de evidência visual;
- Criação de registro visual da missão;
- Upload de imagem para log da missão;
- Listagem de logs;
- Build Android via EAS.

---

## Status da Entrega

| Item | Status |
|---|---|
| Backend/API REST | Concluído |
| Banco PostgreSQL Neon | Concluído |
| Prisma ORM e migrations | Concluído |
| Seed de dados demonstrativos | Concluído |
| Autenticação JWT | Concluída |
| Perfis CREW e CONTROL | Concluídos |
| Dashboard Web Controle Terra | Concluído |
| App Mobile Tripulação | Concluído |
| Mensagens assíncronas | Concluídas |
| Status de mensagens | Concluídos |
| Tarefas operacionais | Concluídas |
| Status de tarefas pelo mobile | Concluído |
| Evidência visual em tarefas | Concluída |
| Logs da missão | Concluídos |
| Registros visuais da missão | Concluídos |
| Upload com Vercel Blob | Concluído |
| Tripulação e sinais vitais simulados | Concluídos |
| Janela de comunicação | Concluída |
| Deploy Backend Vercel | Concluído |
| Deploy Web Vercel | Concluído |
| Build Android EAS | Concluído |
| README unificado | Concluído |
| Vídeo Pitch | Concluído |
| PDF Final | A gerar |

---

## Decisões Técnicas

### Separação entre Web, Mobile e Backend

A solução foi organizada em três partes principais:

- `backend`: API, banco e upload;
- `web`: dashboard do Controle Terra;
- `mobile`: app da tripulação.

Essa separação facilita o entendimento da arquitetura e deixa claro o papel de cada ambiente.

### API REST Própria

A API foi criada separadamente para centralizar regras de negócio, autenticação, persistência de dados e comunicação entre web e mobile.

### PostgreSQL Neon

O Neon foi utilizado para hospedar o banco PostgreSQL online, permitindo persistência real dos dados e integração com o deploy na Vercel.

### Prisma ORM

O Prisma foi usado para modelagem do banco, migrations, consultas e seed de dados demonstrativos.

### Vercel Blob

O Vercel Blob foi usado para armazenar imagens enviadas pela tripulação, incluindo:

- evidências visuais de tarefas;
- registros visuais da missão.

### JWT

A autenticação com JWT permite que o mesmo backend seja consumido pelo app mobile e pelo dashboard web, respeitando perfis diferentes.

### Uma imagem por registro

Para manter o MVP simples e robusto, foi adotada a regra:

```txt
1 tarefa = até 1 imagem de evidência
1 log = até 1 imagem de registro visual
```

Essa decisão evita complexidade desnecessária de galeria e mantém o fluxo claro para demonstração.

### Mobile como ambiente de execução

As ações de execução de tarefas foram concentradas no app mobile, pois, no contexto da missão, quem realiza as tarefas são os astronautas.

O dashboard web atua como ambiente de monitoramento e coordenação do Controle Terra.

---

## Pitch Técnico da Solução

O MarsLink simula uma missão humana a Marte, onde a comunicação com a Terra sofre atraso e não pode depender de respostas instantâneas.

A tripulação usa o app mobile para enviar mensagens, executar tarefas, atualizar status e registrar evidências visuais. O Controle Terra usa o dashboard web para acompanhar a operação, enviar instruções, visualizar logs, monitorar sinais vitais e validar evidências.

O backend integra os dois ambientes com API REST, autenticação JWT, banco PostgreSQL e armazenamento de imagens em nuvem.

A solução demonstra uma arquitetura resiliente que pode ser aplicada tanto em missões espaciais quanto em cenários terrestres com infraestrutura limitada.

---

## Integrantes

| Nome | RM |
|---|---|
| Natalia Guaita | RM560106 |
| Patricia Eihara | RM559419 |
| Rafael Santos | RM560567 |

---

## Observações Finais

O MarsLink evoluiu de uma proposta conceitual para uma solução full stack funcional, com app mobile, painel web, API REST, banco de dados online, autenticação, armazenamento de imagens, deploy e build Android.

A solução mostra como a tecnologia espacial pode inspirar sistemas úteis também na Terra, especialmente em ambientes onde a comunicação é limitada, instável ou crítica.

Ao conectar tripulação e Controle Terra em uma arquitetura integrada, o MarsLink apresenta uma resposta prática ao desafio de coordenação em condições extremas.
