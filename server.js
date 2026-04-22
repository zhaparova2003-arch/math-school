const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0] });
  } catch (err) {
    console.error("HEALTH ERROR:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body || {};

  if (!login || !password) {
    return res.status(400).json({
      success: false,
      message: "Введите логин и пароль"
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, login, password, fio, class, role FROM users WHERE login = $1 AND password = $2 LIMIT 1',
      [login, password]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: "Неверный логин или пароль"
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        login: user.login,
        fio: user.fio,
        class: user.class,
        role: user.role
      }
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Ошибка сервера",
      error: err.message
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("Server started on port", port);
});
