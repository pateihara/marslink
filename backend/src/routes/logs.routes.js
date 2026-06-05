//src/routes/logs.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const { missionId } = req.user;

    const logs = await prisma.missionLog.findMany({
      where: {
        missionId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(logs);
  } catch (error) {
    console.error("Erro ao listar logs:", error);

    return res.status(500).json({
      message: "Erro ao listar logs.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { missionId, id: authorId } = req.user;
    const { title, content, mood } = req.body;

    if (!title || !content || !mood) {
      return res.status(400).json({
        message: "Título, conteúdo e humor são obrigatórios.",
      });
    }

    const log = await prisma.missionLog.create({
      data: {
        missionId,
        authorId,
        title,
        content,
        mood,
      },
      include: {
        author: true,
      },
    });

    return res.status(201).json(log);
  } catch (error) {
    console.error("Erro ao criar log:", error);

    return res.status(500).json({
      message: "Erro ao criar log.",
    });
  }
});

module.exports = router;