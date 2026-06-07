//upload.routes.js
const express = require("express");
const multer = require("multer");
const { put } = require("@vercel/blob");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new Error("Formato inválido. Envie uma imagem JPG, PNG ou WEBP."),
      );
    }

    return callback(null, true);
  },
});

router.post(
  "/mission-image",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Nenhuma imagem foi enviada.",
        });
      }

      const originalName = req.file.originalname || "mission-image.jpg";

      const safeFileName = originalName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9.]+/g, "-")
        .toLowerCase();

      const filePath = `marslink/mission-logs/${Date.now()}-${safeFileName}`;

      const blob = await put(filePath, req.file.buffer, {
        access: "public",
        contentType: req.file.mimetype,
        addRandomSuffix: true,
      });

      return res.status(201).json({
        url: blob.url,
        pathname: blob.pathname,
        contentType: req.file.mimetype,
        size: req.file.size,
      });
    } catch (error) {
      console.error("Erro ao enviar imagem para o Blob:", error);

      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Erro ao enviar imagem da missão.",
      });
    }
  },
);

module.exports = router;