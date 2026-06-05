//src/routes/crew.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const crew = await prisma.user.findMany({
      where: {
        role: "CREW",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        vitals: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json(crew);
  } catch (error) {
    console.error("Erro ao listar tripulação:", error);

    return res.status(500).json({
      message: "Erro ao listar tripulação.",
    });
  }
});

module.exports = router;