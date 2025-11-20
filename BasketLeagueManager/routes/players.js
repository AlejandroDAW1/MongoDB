const express = require("express");

let Player = require(__dirname + "/../models/player.js");
let Team = require(__dirname + "/../models/team.js");

let router = express.Router();

router.get("/players", async (req, res) => {
  try {
    const players = await Player.find({});
    if (players.length === 0) {
      return res.status(404).json({
        message: "No existen jugadores registrados en el sistema.",
        players: [],
      });
    }
    res.status(200).json({ players });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
});

router.get("/players/:id", async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({
        message: "No existe ese jugador en el sistema.",
        player: null,
      });
    }
    res.status(200).json({ player });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
});

router.get("/players/find", async (req, res) => {
  try {
    const nombre = req.query.name;

    if (!nombre) {
      return res.status(400).json({
        message: "Falta el parámetro de búsqueda.",
      });
    }

    const players = await Player.find({
      name: { $regex: nombre, $options: "i" },
    });

    if (players.length === 0) {
      return res.status(404).json({
        message: "No existen jugadores con ese nombre.",
        players: [],
      });
    }

    res.status(200).json({ players });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
});

router.post("/players", async (req, res) => {
  try {
    const { nickname, name, country, birthDate, role } = req.body;

    if (!nickname || !name || !country || !birthDate || !role) {
      return res.status(400).json({
        message: "Datos incorrectos: faltan campos obligatorios",
      });
    }

    const existingPlayer = await Player.findOne({ nickname });

    if (existingPlayer) {
      return res.status(400).json({
        message: "El nickname ya está registrado",
      });
    }

    const newPlayer = new Player({
      nickname,
      name,
      country,
      birthDate,
      role,
    });

    const player = await newPlayer.save();

    res.status(201).json({
      message: "El jugador se ha creado correctamente",
      player,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
});

router.put("/players/:id", async (req, res) => {
  try {
    const playerId = req.params.id;
    const { nickname, name, country, birthDate, role } = req.body;

    let player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        message: "Jugador no encontrado",
      });
    }
    if (nickname && nickname !== player.nickname) {
      const existingPlayer = await Player.findOne({ nickname });

      if (existingPlayer) {
        return res.status(400).json({
          message: "El nickname ya está siendo utilizado por otro jugador",
        });
      }

      player.nickname = nickname;
    }

    player.name = name || player.name;
    player.country = country || player.country;
    player.birthDate = birthDate || player.birthDate;
    player.role = role || player.role;

    const updatedPlayer = await player.save();

    res.status(200).json({
      message: "El jugador se ha actualizado correctamente",
      player: updatedPlayer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
});
router.delete("/players/:id", async (req, res) => {
  try {
    const playerId = req.params.id;

    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({
        message: "Jugador no encontrado",
      });
    }

    const activeTeam = await Team.findOne({
      "roster.player": playerId,
      "roster.active": true,
    });

    if (activeTeam) {
      return res.status(400).json({
        message:
          "No se puede eliminar el jugador porque está activo en algún equipo.",
      });
    }

    const deletedPlayer = await Player.findByIdAndRemove(playerId);

    res.status(200).json({
      message: "El jugador se ha eliminado correctamente",
      player: deletedPlayer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error interno del servidor.",
      error: error.message,
    });
  }
});

module.exports = router;
