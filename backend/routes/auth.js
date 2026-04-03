const express = require("express");
const router = express.Router();
const db = require("../models/db");

// TEST ROUTE
router.get("/test", (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.send(rows);
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { phone, password } = req.body;

  db.get(
    `SELECT * FROM users WHERE phone=? AND password=?`,
    [phone, password],
    (err, user) => {
      if (err) return res.status(500).send(err);

      if (!user) {
        return res.status(401).send({ message: "Invalid login" });
      }

      res.send(user);
    },
  );
});

module.exports = router;
