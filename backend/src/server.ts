import express from "express";
import cors from "cors";
import pool from "./db.js";
import { readFile } from "node:fs/promises";
import argon2 from "argon2";
import crypto from "node:crypto";

const app = express();

app.use(express.json());
app.use(cors());

const retrieveUserDailyQuery = await readFile(
  "sql/004_retrieve_user_daily.sql",
  "utf-8",
);
const retrieveUserGoalsQuery = await readFile(
  "sql/005_retrieve_user_goals.sql",
  "utf-8",
);
const swapDailyCheckedQuery = await readFile(
  "sql/006_swap_daily_checked.sql",
  "utf-8",
);
const swapGoalsCheckedQuery = await readFile(
  "sql/007_swap_goals_checked.sql",
  "utf-8",
);
const createDailyQuery = await readFile("sql/008_create_daily.sql", "utf-8");
const createGoalsQuery = await readFile("sql/009_create_goals.sql", "utf-8");
const removeDailyQuery = await readFile("sql/010_remove_daily.sql", "utf-8");
const removeGoalQuery = await readFile("sql/011_remove_goal.sql", "utf-8");
const getUserQuery = await readFile("sql/012_get_user.sql", "utf-8");
const checkUserUniquenessQuery = await readFile(
  "sql/013_check_user_uniqueness.sql",
  "utf-8",
);
const createUserQuery = await readFile("sql/014_create_user.sql", "utf-8");

app.post("/add/daily", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const input = req.body["name"];
  const complete = req.body["complete"];

  await pool.query(createDailyQuery, [UserId, input, false, complete]);

  res.json({ status: "SUCCESS" });
});

app.put("/swap/daily", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const daily_id = req.body["daily_id"];

  await pool.query(swapDailyCheckedQuery, [daily_id]);

  res.json({ status: "SUCCESS" });
});

app.get("/lists/daily", async (req, res) => {
  const id = req["headers"].user_id;
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const result = await pool.query(retrieveUserDailyQuery, [UserId]);

  res.json({ list: result.rows });
});

app.delete("/lists/daily", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const daily_id = req.body["daily_id"];

  await pool.query(removeDailyQuery, [daily_id]);

  res.json({ status: "SUCCESS" });
});

app.post("/add/goal", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const input = req.body["name"];

  await pool.query(createGoalsQuery, [UserId, input, false]);

  res.json({ status: "SUCCESS" });
});

app.put("/swap/goals", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const goal_id = req.body["goal_id"];

  await pool.query(swapGoalsCheckedQuery, [goal_id]);

  res.json({ status: "SUCCESS" });
});

app.get("/lists/goals", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const result = await pool.query(retrieveUserGoalsQuery, [UserId]);

  res.json({ list: result.rows });
});

app.delete("/lists/goals", async (req, res) => {
  const id = req.headers["user_id"];
  const UserId = parseInt(typeof id == "string" ? id : "0", 10);

  const goal_id = req.body["goal_id"];

  await pool.query(removeGoalQuery, [goal_id]);

  res.json({ status: "SUCCESS" });
});

app.post("/signup", async (req, res) => {
  const user = req.body["username"];
  const pass = req.body["password"];

  const result = await pool.query(checkUserUniquenessQuery, [user]);

  if (result.rowCount != null && result.rowCount > 0) {
    const hashpass = argon2.hash(pass);
    await pool.query(createUserQuery, [user, hashpass]);
    res.json({ status: "SUCCESS" });
  } else {
    res.json({ status: "FAILURE" });
  }
});

app.get("/verify", async (req, res) => {
  const user = req.body["username"];
  const pass = req.body["password"];

  const result = await pool.query(getUserQuery, [user]);

  if (!result) {
    res.json({ status: "FAILURE" });
    return;
  }

  const userPass = result.rows[0].pass;

  const verified = await argon2.verify(userPass, pass);

  if (verified) {
    const uuid = crypto.randomUUID();

    res.cookie("session_id", uuid, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  } else {
    res.json({ status: "FAILURE" });
  }

  res.json({ status: "SUCCESS" });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
