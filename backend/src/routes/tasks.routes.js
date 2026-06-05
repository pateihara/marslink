//src/routes/tasks.routes.js
const express = require("express");
const prisma = require("../lib/prisma");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const { missionId } = req.user;

    const tasks = await prisma.task.findMany({
      where: {
        missionId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            role: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: [
        {
          priority: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return res.json(tasks);
  } catch (error) {
    console.error("Erro ao listar tarefas:", error);

    return res.status(500).json({
      message: "Erro ao listar tarefas.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { missionId, id: createdById } = req.user;
    const { title, description, assigneeId, priority, dueDay } = req.body;

    if (!title) {
      return res.status(400).json({
        message: "O título da tarefa é obrigatório.",
      });
    }

    const task = await prisma.task.create({
      data: {
        missionId,
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        createdById,
        priority: priority || "NORMAL",
        dueDay: dueDay || null,
      },
      include: {
        assignee: true,
        createdBy: true,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);

    return res.status(500).json({
      message: "Erro ao criar tarefa.",
    });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigneeId, priority, status, dueDay } = req.body;

    const task = await prisma.task.update({
      where: {
        id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(dueDay !== undefined && { dueDay }),
      },
      include: {
        assignee: true,
        createdBy: true,
      },
    });

    return res.json(task);
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);

    return res.status(500).json({
      message: "Erro ao atualizar tarefa.",
    });
  }
});

module.exports = router;