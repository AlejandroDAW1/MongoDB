const express = require("express");
let Match = require(__dirname + "/../models/match.js");
let Team = require(__dirname + "/../models/team.js");

let router = express.Router();

router.get("/matches", async (req, res) => {
  try {
    const listaPartidos = await Match.find({})
      .populate("homeTeam", "name")
      .populate("awayTeam", "name");

    if (listaPartidos.length === 0) {
      return res.status(404).json({
        message: "No existen partidos registrados.",
        matches: [],
      });
    }

    res.status(200).json({ matches: listaPartidos });
  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const partidoId = req.params.id;

    const partido = await Match.findById(partidoId)
      .populate("homeTeam")
      .populate("awayTeam")
      .populate("playerStats.player");

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    res.status(200).json({ match: partido });
  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.post("/matches", async (req, res) => {
  try {
    const {
      tournament,
      date,
      stage,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
    } = req.body;

    if (
      !tournament ||
      !date ||
      !stage ||
      !homeTeam ||
      !awayTeam ||
      homeScore === undefined ||
      awayScore === undefined
    ) {
      return res.status(400).json({
        message: "Faltan campos obligatorios.",
      });
    }

    if (homeTeam === awayTeam) {
      return res.status(400).json({
        message: "El equipo local y visitante no pueden ser el mismo.",
      });
    }

    let nuevoPartido = new Match({
      tournament,
      date,
      stage,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
    });

    const partidoGuardado = await nuevoPartido.save();

    const partidoPoblado = await Match.findById(partidoGuardado._id)
      .populate("homeTeam", "name")
      .populate("awayTeam", "name");

    res.status(201).json({
      message: "El partido se ha creado correctamente.",
      match: partidoPoblado,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.delete("/matches/:id", async (req, res) => {
  try {
    const partidoId = req.params.id;

    const partido = await Match.findById(partidoId);

    if (!partido) {
      return res.status(404).json({
        message: "Partido no encontrado.",
      });
    }

    const partidoEliminado = await Match.findByIdAndDelete(partidoId);

    res.status(200).json({
      message: "El partido se ha eliminado correctamente.",
      match: partidoEliminado,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

module.exports = router;
