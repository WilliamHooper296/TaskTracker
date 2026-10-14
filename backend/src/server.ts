import express from "express";
import cors from "cors";
import pool from "./db.js";
import { readFile } from "node:fs/promises";
import argon2 from "argon2";
import crypto, { verify } from "node:crypto";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

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
const createSessionQuery = await readFile(
  "sql/016_create_session.sql",
  "utf-8",
);
const endSessionQuery = await readFile("sql/017_end_session.sql", "utf-8");
const updateSessionQuery = await readFile(
  "sql/018_update_session.sql",
  "utf-8",
);
const getSessionIdQuery = await readFile("sql/019_get_session_id.sql", "utf-8");
const getSessionByUserQuery = await readFile(
  "sql/020_get_session_by_user.sql",
  "utf-8",
);

async function verifySession(req: Request, res: Response, next: NextFunction) {
  const session = req.cookies.session_id;
  if (!session) {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }

  const user_data = await pool.query(getSessionIdQuery, [session]);

  if (user_data.rowCount == null || user_data.rowCount < 1) {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }

  const now = new Date();
  const last_query = new Date(user_data.rows[0].last_query);
  const expirey = new Date(user_data.rows[0].expirey);

  if (now > expirey || now.getTime() > last_query.getTime() + 1000 * 60 * 30) {
    await pool.query(endSessionQuery, [session]);
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  } else {
    await pool.query(updateSessionQuery, [session]);
    res.locals.user_id = user_data.rows[0].user_id;
    res.locals.session_id = user_data.rows[0].session_id;
  }

  next();
}

app.post("/add/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const input = req.body["name"];
  const complete = req.body["complete"];

  await pool.query(createDailyQuery, [id, input, false, complete]);

  res.json({ status: "SUCCESS" });
});

app.put("/swap/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const daily_id = req.body["daily_id"];

  await pool.query(swapDailyCheckedQuery, [daily_id]);

  res.json({ status: "SUCCESS" });
});

app.get("/lists/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const result = await pool.query(retrieveUserDailyQuery, [id]);

  res.json({ status: "SUCCESS", list: result.rows });
});

app.delete("/lists/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const daily_id = req.body["daily_id"];

  await pool.query(removeDailyQuery, [daily_id]);

  res.json({ status: "SUCCESS" });
});

app.post("/add/goal", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const input = req.body["name"];

  await pool.query(createGoalsQuery, [id, input, false]);

  res.json({ status: "SUCCESS" });
});

app.put("/swap/goals", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const goal_id = req.body["goal_id"];

  await pool.query(swapGoalsCheckedQuery, [goal_id]);

  res.json({ status: "SUCCESS" });
});

app.get("/lists/goals", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const result = await pool.query(retrieveUserGoalsQuery, [id]);

  res.json({ list: result.rows });
});

app.delete("/lists/goals", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const goal_id = req.body["goal_id"];

  await pool.query(removeGoalQuery, [goal_id]);

  res.json({ status: "SUCCESS" });
});

app.post("/signup", async (req, res) => {
  const user = req.body["username"];
  const pass = req.body["password"];

  const result = await pool.query(checkUserUniquenessQuery, [user]);

  if (result.rowCount == null || result.rowCount < 1) {
    const hashpass = await argon2.hash(pass);
    await pool.query(createUserQuery, [user, hashpass]);
    res.json({ status: "SUCCESS" });
  } else {
    res.json({ status: "FAILURE" });
  }
});

app.post("/login", async (req, res) => {
  const user = req.body["username"];
  const pass = req.body["password"];

  const result = await pool.query(getUserQuery, [user]);

  if (result.rowCount == null || result.rowCount < 1) {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }

  const userPass = result.rows[0].pass;

  const verified = await argon2.verify(userPass, pass);

  if (verified) {
    const user_id = result.rows[0].user_id;

    const exists = await pool.query(getSessionByUserQuery, [user_id]);
    if (exists.rowCount != null && exists.rowCount > 0) {
      res.cookie("session_id", exists.rows[0].session_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      res.json({ status: "SUCCESS" });
      return;
    }

    const uuid = crypto.randomUUID();

    await pool.query(createSessionQuery, [uuid, user_id]);

    res.cookie("session_id", uuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  } else {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }

  res.json({ status: "SUCCESS" });
});

app.get("/logout", async (req, res) => {
  const session_id = req.cookies.session_id;
  if (session_id) {
    await pool.query(endSessionQuery, [session_id]);
  }

  res.clearCookie("session_id", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(200).json({ status: "SUCCESS" });
});

app.get("/verifyUser", verifySession, (req, res) => {
  res.status(200).json({ status: "AUTHORIZED" });
});

export default app