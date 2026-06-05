//src/routes/vitals.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const vitals = await prisma.vital.findMany({
      include: {
        user: {
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

    return res.json(vitals);
  } catch (error) {
    console.error("Erro ao listar sinais vitais:", error);

    return res.status(500).json({
      message: "Erro ao listar sinais vitais.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { heartRate, oxygen, temperature, stressLevel } = req.body;

    const vital = await prisma.vital.create({
      data: {
        userId,
        heartRate,
        oxygen,
        temperature,
        stressLevel,
      },
    });

    return res.status(201).json(vital);
  } catch (error) {
    console.error("Erro ao registrar sinais vitais:", error);

    return res.status(500).json({
      message: "Erro ao registrar sinais vitais.",
    });
  }
});

module.exports = router;