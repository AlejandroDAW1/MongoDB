const express = require("express");

let Team = require(__dirname + "/../models/team.js");
let Player = require(__dirname + "/../models/player.js");
let Match = require(__dirname + "/../models/match.js");

let router = express.Router();

router.get("/teams", async (req, res) => {
  try {
    let listaTeams = await Team.find({});

    if (listaTeams.length === 0) {
      return res.status(404).json({
        message: "No existen equipos registrados en el sistema.",
        teams: [],
      });
    }

    res.status(200).json({ teams: listaTeams });

  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.get("/teams/:id", async (req, res) => {
  try {
    let teamId = req.params.id;

    let equipo = await Team.findById(teamId).populate({
      path: "roster.player",
      match: { active: true },
    });

    if (!equipo) {
      return res.status(404).json({
        message: "No existe ese equipo en el sistema.",
        team: null,
      });
    }

    res.status(200).json({ team: equipo });

  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.post("/teams", async (req, res) => {
  try {
    let nombre = req.body.name;

    if (!nombre || nombre.trim() === "") {
      return res.status(400).json({
        message: "Datos incorrectos: falta el nombre del equipo",
      });
    }

    let equipoExiste = await Team.findOne({ name: nombre });

    if (equipoExiste) {
      return res.status(400).json({
        message: "Datos incorrectos: ya existe un equipo con ese nombre",
      });
    }

    let nuevoEquipo = new Team({ name: nombre });
    let equipoGuardado = await nuevoEquipo.save();

    res.status(201).json({
      message: "El equipo se ha creado correctamente",
      team: equipoGuardado,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.post("/teams/:id/roster", async (req, res) => {
  try {
    let teamId = req.params.id;
    let jugadorId = req.body.player;
    let fechaEntrada = req.body.joinDate;
    let activo = req.body.active;

    let equipo = await Team.findById(teamId);
    if (!equipo) {
      return res.status(404).json({ message: "Equipo no encontrado." });
    }

    let jugador = await Player.findById(jugadorId);
    if (!jugador) {
      return res.status(404).json({ message: "Jugador no encontrado." });
    }

    let yaEnEquipo = equipo.roster.some(
      r => r.player.toString() === jugadorId && r.active === true
    );

    if (yaEnEquipo) {
      return res.status(400).json({
        message: "El jugador ya está activo en el roster de este equipo.",
      });
    }

    let enOtroTeam = await Team.findOne({
      _id: { $ne: teamId },
      "roster.player": jugadorId,
      "roster.active": true,
    });

    if (enOtroTeam) {
      return res.status(400).json({
        message: "El jugador está activo en otro equipo.",
      });
    }

    equipo.roster.push({
      player: jugadorId,
      joinDate: fechaEntrada,
      active: activo,
    });

    await equipo.save();

    let equipoActualizado = await Team.findById(teamId).populate("roster.player");

    res.status(200).json({
      message: "Jugador añadido correctamente al roster",
      team: equipoActualizado,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.delete("/teams/:id/roster/:playerId", async (req, res) => {
  try {
    let teamId = req.params.id;
    let jugadorId = req.params.playerId;

    let equipo = await Team.findById(teamId);

    if (!equipo) {
      return res.status(404).json({
        message: "Equipo no encontrado.",
      });
    }

    let jugadorEnRoster = equipo.roster.find(
      r => r.player.toString() === jugadorId && r.active === true
    );

    if (!jugadorEnRoster) {
      return res.status(404).json({
        message: "El jugador no está activo en el roster de este equipo.",
      });
    }

    jugadorEnRoster.active = false;
    await equipo.save();

    let equipoFinal = await Team.findById(teamId).populate("roster.player");

    res.status(200).json({
      message: "El jugador ha sido dado de baja correctamente",
      team: equipoFinal,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

router.delete("/teams/:id", async (req, res) => {
  try {
    let teamId = req.params.id;

    let equipo = await Team.findById(teamId);

    if (!equipo) {
      return res.status(404).json({
        message: "Equipo no encontrado.",
      });
    }

    let tienePartidos = await Match.findOne({
      $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
    });

    if (tienePartidos) {
      return res.status(400).json({
        message: "No se puede eliminar el equipo porque tiene partidos asociados.",
      });
    }

    let eliminado = await Team.findOneAndDelete({ _id: teamId });

    res.status(200).json({
      message: "El equipo se ha eliminado correctamente",
      team: eliminado,
    });

  } catch (err) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: err.message,
    });
  }
});

module.exports = router;