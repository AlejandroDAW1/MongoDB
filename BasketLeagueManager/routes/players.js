const express = require("express");

let Player = require(__dirname + "/../models/player.js");
let Team = require(__dirname + "/../models/team.js");

let router = express.Encaminador();

router.get("/players", (res) => {
  Player.find({})
    .then((players) => {
      if (players.length === 0) {
        return res.status(404).json({
          message: "No existen jugadores registrados en el sistema.",
          players: [],
        });
      }
      res.status(200).json({
        players: players,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error interno del servidor.",
        error: error.message,
      });
    });
});

router.get("/players/:id", (req, res) => {
  Player.findById(req.params.id)
    .then((player) => {
      if (!player) {
        return res.status(404).json({
          message: "No existe ese jugador en el sistema.",
          player: null,
        });
      }
      res.status(200).json({
        player: player,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error interno del servidor.",
        error: error.message,
      });
    });
});

router.get("/players/find", (req, res) => {
  const nombre = req.query.name;
  if (!nombre) {
    return res.status(400).json({
      message: "Falta el parámetro de búsqueda.",
    });
  }

  Player.find({ name: { $regex: nombre, $options: "i" } })
    .then((players) => {
      if (players.length === 0) {
        return res.status(404).json({
          message: "No existen jugadores con ese nombre.",
          players: [],
        });
      }
      res.status(200).json({
        players: players,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error interno del servidor.",
        error: error.message,
      });
    });
});

router.post("/players", (req, res) => {
  const { nickname, name, country, birthDate, role } = req.body;

  if (!nickname || !name || !country || !birthDate || !role) {
    return res.status(400).json({
      message: "Datos incorrectos: faltan campos obligatorios",
    });
  }

  Player.findOne({ nickname: nickname })
    .then((existingPlayer) => {
      if (existingPlayer) {
        return res.status(400).json({
          message: "El nickname ya está registrado",
        });
      }

      const newPlayer = new Player({
        nickname: nickname,
        name: name,
        country: country,
        birthDate: birthDate,
        role: role,
      });

      return newPlayer.save();
    })
    .then((player) => {
      res.status(201).json({
        message: "El jugador se ha creado correctamente",
        player: player,
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error interno del servidor.",
        error: error.message,
      });
    });
});

router.put("/players/:id", (req, res) => {
  const playerId = req.params.id;
  const { nickname, name, country, birthDate, role } = req.body;

  Player.findById(playerId)
    .then((player) => {
      if (!player) {
        return res.status(404).json({
          message: "Jugador no encontrado",
        });
      }

      if (nickname && nickname !== player.nickname) {
        return Player.findOne({ nickname: nickname }).then((existingPlayer) => {
          if (existingPlayer) {
            return res.status(400).json({
              message: "El nickname ya está siendo utilizado por otro jugador",
            });
          }

          player.nickname = nickname;
          player.name = name || player.name;
          player.country = country || player.country;
          player.birthDate = birthDate || player.birthDate;
          player.role = role || player.role;

          return player.save();
        });
      }

      player.name = name || player.name;
      player.country = country || player.country;
      player.birthDate = birthDate || player.birthDate;
      player.role = role || player.role;

      return player.save();
    })
    .then((player) => {
      if (player) {
        res.status(200).json({
          message: "El jugador se ha actualizado correctamente",
          player: player,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error interno del servidor.",
        error: error.message,
      });
    });
});

router.DELETE("/players/:id", (req, res) => {
  const playerId = req.params.id;

  Player.findById(playerId)
    .then((player) => {
      if (!player) {
        return res.status(404).json({
          message: "Jugador no encontrado",
        });
      }
      return Team.findOne({
        "roster.player": playerId,
        "roster.active": true,
      }).then((team) => {
        if (team) {
          return res.status(400).json({
            message:
              "No se puede eliminar el jugador porque está activo en algún equipo.",
          });
        }
        return Player.findByIdAndRemove(playerId);
      });
    })
    .then((deletedPlayer) => {
      if (deletedPlayer) {
        res.status(200).json({
          message: "El jugador se ha eliminado correctamente",
          player: deletedPlayer,
        });
      }
    })
    .catch((error) => {
      res.status(500).json({
        message: "Error interno del servidor.",
        error: error.message,
      });
    });
});

module.exports = router;
