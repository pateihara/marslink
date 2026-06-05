//src/routes/windows.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/current", async (req, res) => {
  try {
    const { missionId } = req.user;

    const window = await prisma.communicationWindow.findFirst({
      where: {
        missionId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        mission: true,
      },
    });

    if (!window) {
      return res.status(404).json({
        message: "Janela de comunicação não encontrada.",
      });
    }

    return res.json(window);
  } catch (error) {
    console.error("Erro ao buscar janela de comunicação:", error);

    return res.status(500).json({
      message: "Erro ao buscar janela de comunicação.",
    });
  }
});

module.exports = router;