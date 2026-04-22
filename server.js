const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post("/login", async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE login=$1 AND password=$2",
      [login, password]
    );

    if (result.rows.length > 0) {
      res.json({ success: true, user: result.rows[0] });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Ошибка сервера");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
