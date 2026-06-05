//src/routes/messages.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
};

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const { missionId } = req.user;

    const messages = await prisma.message.findMany({
      where: {
        missionId,
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receiver: {
          select: publicUserSelect,
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(messages);
  } catch (error) {
    console.error("Erro ao listar mensagens:", error);

    return res.status(500).json({
      message: "Erro ao listar mensagens.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { missionId, id: senderId } = req.user;
    const { content, receiverId, priority } = req.body;

    if (!content) {
      return res.status(400).json({
        message: "O conteúdo da mensagem é obrigatório.",
      });
    }

    const mission = await prisma.mission.findUnique({
      where: {
        id: missionId,
      },
    });

    if (!mission) {
      return res.status(404).json({
        message: "Missão não encontrada.",
      });
    }

    const message = await prisma.message.create({
      data: {
        missionId,
        senderId,
        receiverId: receiverId || null,
        content,
        priority: priority || "NORMAL",
        status: "QUEUED",
        queuedAt: new Date(),
        delayMinutes: mission.delayMinutes,
        statusHistory: {
          create: [
            {
              status: "CREATED",
              note: "Mensagem criada localmente.",
            },
            {
              status: "QUEUED",
              note: "Mensagem adicionada à fila de transmissão.",
            },
          ],
        },
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receiver: {
          select: publicUserSelect,
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return res.status(201).json(message);
  } catch (error) {
    console.error("Erro ao criar mensagem:", error);

    return res.status(500).json({
      message: "Erro ao criar mensagem.",
    });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const allowedStatus = [
      "CREATED",
      "QUEUED",
      "SENT",
      "DELIVERED",
      "ACKNOWLEDGED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        message: "Status inválido.",
      });
    }

    const dateFieldByStatus = {
      QUEUED: "queuedAt",
      SENT: "sentAt",
      DELIVERED: "deliveredAt",
      ACKNOWLEDGED: "acknowledgedAt",
    };

    const updateData = {
      status,
    };

    const dateField = dateFieldByStatus[status];

    if (dateField) {
      updateData[dateField] = new Date();
    }

    const message = await prisma.message.update({
      where: {
        id,
      },
      data: {
        ...updateData,
        statusHistory: {
          create: {
            status,
            note: note || `Status atualizado para ${status}.`,
          },
        },
      },
      include: {
        sender: {
          select: publicUserSelect,
        },
        receiver: {
          select: publicUserSelect,
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return res.json(message);
  } catch (error) {
    console.error("Erro ao atualizar status da mensagem:", error);

    return res.status(500).json({
      message: "Erro ao atualizar status da mensagem.",
    });
  }
});

module.exports = router;