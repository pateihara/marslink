//prisma/seed.js
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed MarsLink...");

  await prisma.messageStatusHistory.deleteMany();
  await prisma.message.deleteMany();
  await prisma.task.deleteMany();
  await prisma.missionLog.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.communicationWindow.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mission.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 10);

  const mission = await prisma.mission.create({
    data: {
      name: "Missão Ares-1",
      code: "ARES2026",
      currentDay: 47,
      phase: "Fase B",
      status: "Operacional",
      distanceKm: 148000000,
      delayMinutes: 18,
      signalQuality: 75,
    },
  });

  const control = await prisma.user.create({
    data: {
      name: "Controle Terra",
      email: "controle@marslink.com",
      passwordHash,
      role: "CONTROL",
      avatar: "CT",
    },
  });

  const commander = await prisma.user.create({
    data: {
      name: "Cmdt. Silva",
      email: "silva@marslink.com",
      passwordHash,
      role: "CREW",
      avatar: "CS",
    },
  });

  const engineer = await prisma.user.create({
    data: {
      name: "Eng. Park",
      email: "park@marslink.com",
      passwordHash,
      role: "CREW",
      avatar: "EP",
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: "Dra. Santos",
      email: "santos@marslink.com",
      passwordHash,
      role: "CREW",
      avatar: "DS",
    },
  });

  const pilot = await prisma.user.create({
    data: {
      name: "Piloto Osei",
      email: "osei@marslink.com",
      passwordHash,
      role: "CREW",
      avatar: "PO",
    },
  });

  await prisma.communicationWindow.create({
    data: {
      missionId: mission.id,
      isOpen: true,
      signalQuality: 75,
      delayMinutes: 18,
      opensAt: new Date(),
      closesAt: new Date(Date.now() + 4 * 60 * 1000),
    },
  });

  await prisma.message.create({
    data: {
      missionId: mission.id,
      senderId: commander.id,
      receiverId: control.id,
      content:
        "Filtro CO₂ operando normalmente após verificação manual. Aguardando confirmação do protocolo 7-B.",
      priority: "HIGH",
      status: "ACKNOWLEDGED",
      delayMinutes: 18,
      queuedAt: new Date(Date.now() - 60 * 60 * 1000),
      sentAt: new Date(Date.now() - 50 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 32 * 60 * 1000),
      acknowledgedAt: new Date(Date.now() - 20 * 60 * 1000),
      statusHistory: {
        create: [
          {
            status: "CREATED",
            note: "Mensagem criada no app da tripulação.",
          },
          {
            status: "QUEUED",
            note: "Mensagem salva na fila offline.",
          },
          {
            status: "SENT",
            note: "Mensagem transmitida durante janela ativa.",
          },
          {
            status: "DELIVERED",
            note: "Mensagem entregue ao Controle Terra.",
          },
          {
            status: "ACKNOWLEDGED",
            note: "Controle Terra confirmou o recebimento.",
          },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      missionId: mission.id,
      senderId: control.id,
      receiverId: commander.id,
      content:
        "Protocolo 7-B aprovado. Podem continuar operações normais. Relatório de status em 2h.",
      priority: "NORMAL",
      status: "DELIVERED",
      delayMinutes: 18,
      queuedAt: new Date(Date.now() - 40 * 60 * 1000),
      sentAt: new Date(Date.now() - 35 * 60 * 1000),
      deliveredAt: new Date(Date.now() - 17 * 60 * 1000),
      statusHistory: {
        create: [
          {
            status: "CREATED",
            note: "Mensagem criada pelo Controle Terra.",
          },
          {
            status: "QUEUED",
            note: "Mensagem adicionada à fila de transmissão.",
          },
          {
            status: "SENT",
            note: "Mensagem enviada para a nave.",
          },
          {
            status: "DELIVERED",
            note: "Mensagem entregue à tripulação.",
          },
        ],
      },
    },
  });

  await prisma.message.create({
    data: {
      missionId: mission.id,
      senderId: engineer.id,
      receiverId: control.id,
      content:
        "Leituras do reator dentro do normal. Telemetria de navegação enviada no bundle anterior.",
      priority: "NORMAL",
      status: "SENT",
      delayMinutes: 18,
      queuedAt: new Date(Date.now() - 25 * 60 * 1000),
      sentAt: new Date(Date.now() - 12 * 60 * 1000),
      statusHistory: {
        create: [
          {
            status: "CREATED",
            note: "Mensagem criada pela engenharia.",
          },
          {
            status: "QUEUED",
            note: "Mensagem enfileirada.",
          },
          {
            status: "SENT",
            note: "Mensagem em trânsito para a Terra.",
          },
        ],
      },
    },
  });

  await prisma.task.createMany({
    data: [
      {
        missionId: mission.id,
        title: "Verificar filtro de CO₂",
        description:
          "Executar inspeção manual do filtro de CO₂ e registrar leitura no log.",
        status: "PENDING",
        priority: "CRITICAL",
        assigneeId: commander.id,
        createdById: control.id,
        dueDay: 47,
      },
      {
        missionId: mission.id,
        title: "Check telemetria de navegação",
        description: "Validar pacote de telemetria antes da próxima janela.",
        status: "DONE",
        priority: "HIGH",
        assigneeId: engineer.id,
        createdById: control.id,
        dueDay: 47,
      },
      {
        missionId: mission.id,
        title: "Check saúde da tripulação",
        description:
          "Realizar coleta de sinais vitais e registrar estado emocional.",
        status: "PENDING",
        priority: "HIGH",
        assigneeId: doctor.id,
        createdById: control.id,
        dueDay: 47,
      },
      {
        missionId: mission.id,
        title: "Ajuste de trajetória",
        description: "Revisar orientação orbital e preparar relatório curto.",
        status: "IN_PROGRESS",
        priority: "NORMAL",
        assigneeId: pilot.id,
        createdById: control.id,
        dueDay: 47,
      },
    ],
  });

  await prisma.missionLog.createMany({
    data: [
      {
        missionId: mission.id,
        authorId: commander.id,
        title: "Rotina do dia 47",
        content:
          "Tripulação operando dentro do esperado. Pequena queda de sinal durante a manhã, sem impacto nas atividades críticas.",
        mood: "FOCUSED",
      },
      {
        missionId: mission.id,
        authorId: doctor.id,
        title: "Estado emocional da tripulação",
        content:
          "Equipe está estável, porém com sinais leves de fadiga acumulada. Recomendada pausa estruturada após o próximo ciclo de tarefas.",
        mood: "TIRED",
      },
    ],
  });

  await prisma.vital.createMany({
    data: [
      {
        userId: commander.id,
        heartRate: 72,
        oxygen: 98,
        temperature: 36.8,
        stressLevel: 28,
      },
      {
        userId: engineer.id,
        heartRate: 76,
        oxygen: 97,
        temperature: 36.7,
        stressLevel: 35,
      },
      {
        userId: doctor.id,
        heartRate: 80,
        oxygen: 98,
        temperature: 36.9,
        stressLevel: 42,
      },
      {
        userId: pilot.id,
        heartRate: 74,
        oxygen: 99,
        temperature: 36.6,
        stressLevel: 31,
      },
    ],
  });

  console.log("Seed MarsLink finalizado com sucesso.");
  console.log("");
  console.log("Credenciais de teste:");
  console.log("Controle Terra:");
  console.log("email: controle@marslink.com");
  console.log("senha: 123456");
  console.log("");
  console.log("Tripulação:");
  console.log("email: silva@marslink.com");
  console.log("senha: 123456");
  console.log("");
  console.log("Código da missão: ARES2026");
}

main()
  .catch((error) => {
    console.error("Erro no seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });