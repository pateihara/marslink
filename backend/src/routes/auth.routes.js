//src/routes/auth.routes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password, missionCode } = req.body;

    if (!email || !password || !missionCode) {
      return res.status(400).json({
        message: "E-mail, senha e código da missão são obrigatórios.",
      });
    }

    const mission = await prisma.mission.findUnique({
      where: {
        code: missionCode,
      },
    });

    if (!mission) {
      return res.status(401).json({
        message: "Código de missão inválido.",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Credenciais inválidas.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Credenciais inválidas.",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        missionId: mission.id,
        missionCode: mission.code,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      mission,
    });
  } catch (error) {
    console.error("Erro no login:", error);

    return res.status(500).json({
      message: "Erro interno ao realizar login.",
    });
  }
});

module.exports = router;