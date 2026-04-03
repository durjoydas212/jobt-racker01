const twilio = require("twilio");
const nodemailer = require("nodemailer");

// TWILIO
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// EMAIL
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const multer = require("multer");
const express = require("express");
const router = express.Router();
const db = require("../models/db");

// ================= STORAGE =================
const storage = multer.diskStorage({
  destination: "uploads/", // must match server.js
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ================= UPLOAD IMAGE =================
router.post("/upload", upload.single("image"), (req, res) => {
  console.log("UPLOAD ROUTE HIT");

  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  res.send({
    url: `/uploads/${req.file.filename}`,
  });
});

// ================= CREATE JOB =================
router.post("/", (req, res) => {
  const { job_number, status, notes, data } = req.body;

  // ADD THIS VALIDATION (IMPORTANT)
  if (!job_number) {
    return res.status(400).send("Job number required");
  }

  db.run(
    `INSERT INTO jobs (job_number, status, notes, data)
     VALUES (?, ?, ?, ?)`,
    [job_number, status, notes, JSON.stringify(data)],
    function (err) {
      if (err) return res.status(500).send(err);

      res.send({ id: this.lastID });
    },
  );
});

// ================= GET JOB =================
router.get("/:job_number", (req, res) => {
  db.all(
    `SELECT * FROM jobs WHERE job_number=? ORDER BY created_at DESC`,
    [req.params.job_number],
    (err, rows) => {
      if (err) return res.status(500).send(err);

      const parsed = rows.map((row) => ({
        ...row,
        data: JSON.parse(row.data || "{}"),
      }));

      res.send(parsed);
    },
  );
});

// GET ALL JOBS (ADMIN)

router.get("/", (req, res) => {
  db.all(
    `
    SELECT * FROM jobs 
    WHERE id IN (
      SELECT MAX(id) FROM jobs GROUP BY job_number
    )
    ORDER BY created_at DESC
  `,
    [],
    (err, rows) => {
      if (err) return res.status(500).send(err);

      const parsed = rows.map((row) => ({
        ...row,
        data: JSON.parse(row.data || "{}"),
      }));

      res.send(parsed);
    },
  );
});

router.post("/approve/:id", (req, res) => {
  db.run(
    `UPDATE jobs SET status='Approved' WHERE id=?`,
    [req.params.id],
    function (err) {
      if (err) return res.status(500).send(err);
      res.send({ success: true });
    },
  );
});

router.put("/:id", (req, res) => {
  const { status } = req.body;
  const id = req.params.id;

  db.run(
    "UPDATE jobs SET status = ? WHERE id = ?",
    [status, id],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ message: "Updated" });
    },
  );
});

module.exports = router;
