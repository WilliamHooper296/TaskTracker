import express from "express";
import cors from "cors";
import pool from "./db.js";
import { readFile } from "node:fs/promises";
import argon2 from "argon2";
import { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://task-tracker-chi-puce.vercel.app",
    ],
    credentials: true,
  }),
);
app.use(cookieParser());

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);
const sqlDir = path.resolve(currentDir, "../sql")

const retrieveUserDailyQuery = await readFile(
  path.join(sqlDir, "004_retrieve_user_daily.sql"),
  "utf-8",
);
const retrieveUserGoalsQuery = await readFile(
  path.join(sqlDir, "005_retrieve_user_goals.sql"),
  "utf-8",
);
const swapDailyCheckedQuery = await readFile(
  path.join(sqlDir, "006_swap_daily_checked.sql"),
  "utf-8",
);
const swapGoalsCheckedQuery = await readFile(
  path.join(sqlDir, "007_swap_goals_checked.sql"),
  "utf-8",
);
const createDailyQuery = await readFile(path.join(sqlDir, "008_create_daily.sql"), "utf-8");
const createGoalsQuery = await readFile(path.join(sqlDir, "009_create_goals.sql"), "utf-8");
const removeDailyQuery = await readFile(path.join(sqlDir, "010_remove_daily.sql"), "utf-8");
const removeGoalQuery = await readFile(path.join(sqlDir, "011_remove_goal.sql"), "utf-8");
const getUserQuery = await readFile(path.join(sqlDir, "012_get_user.sql"), "utf-8");
const checkUserUniquenessQuery = await readFile(
  path.join(sqlDir, "013_check_user_uniqueness.sql"),
  "utf-8",
);
const createUserQuery = await readFile(path.join(sqlDir, "014_create_user.sql"), "utf-8");
const createSessionQuery = await readFile(
  path.join(sqlDir, "016_create_session.sql"),
  "utf-8",
);
const endSessionQuery = await readFile(path.join(sqlDir, "017_end_session.sql"), "utf-8");
const updateSessionQuery = await readFile(
  path.join(sqlDir, "018_update_session.sql"),
  "utf-8",
);
const getSessionIdQuery = await readFile(path.join(sqlDir, "019_get_session_id.sql"), "utf-8");
const getSessionByUserQuery = await readFile(
  path.join(sqlDir, "020_get_session_by_user.sql"),
  "utf-8",
);
const generateDailyQuery = await readFile(
  path.join(sqlDir, "022_generate_daily.sql"),
  "utf-8",
);
const createTemplateQuery = await readFile(
  path.join(sqlDir, "023_create_template.sql"),
  "utf-8",
);
const deleteTemplateQuery = await readFile(
  path.join(sqlDir, "024_delete_template.sql"),
  "utf-8",
);
const retrieveArchiveQuery = await readFile(
  path.join(sqlDir, "025_retrieve_archive.sql"),
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

app.get("/database/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS time");
    res.json({ status: "SUCCESS", time: result });
  } catch (e) {
    res.json({ status: "FAILED", error: e });
  }
});

app.post("/add/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const input = req.body["name"];
  const complete = req.body["complete"];

  //validate complete

  await pool.query(createTemplateQuery, [id, input, complete]);

  res.json({ status: "SUCCESS" });
});

app.put("/swap/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const daily_id = req.body["daily_id"];

  await pool.query(swapDailyCheckedQuery, [daily_id, id]);

  res.json({ status: "SUCCESS" });
});

app.get("/lists/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const result = await pool.query(retrieveUserDailyQuery, [id]);

  res.json({ status: "SUCCESS", list: result.rows });
});

app.delete("/lists/daily", verifySession, async (req, res) => {
  const id = res.locals.user_id;

  const template_id = req.body["template_id"];

  await pool.query(removeDailyQuery, [template_id]);
  await pool.query(deleteTemplateQuery, [template_id]);

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

  await pool.query(swapGoalsCheckedQuery, [goal_id, id]);

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
    await pool.query(generateDailyQuery, [user_id]);

    const exists = await pool.query(getSessionByUserQuery, [user_id]);
    if (exists.rowCount != null && exists.rowCount > 0) {
      res.cookie("session_id", exists.rows[0].session_id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });
      res.json({ status: "SUCCESS" });
      return;
    }

    const uuid = crypto.randomUUID();

    await pool.query(createSessionQuery, [uuid, user_id]);

    res.cookie("session_id", uuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    res.json({ status: "SUCCESS" });
  } else {
    res.status(401).json({ status: "UNAUTHORIZED" });
    return;
  }
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

app.get("/archive", verifySession, async (req, res) => {
  //returns { contents: {date: checked}  }
  const id = res.locals.user_id;

  const archive = await pool.query(retrieveArchiveQuery, [id]);

  const records: Record<string, Record<string, boolean>> = {};

  for (const row of archive.rows) {
    const contents = row.contents;
    const date = new Date(row.created_at).toISOString().split("T")[0];

    if (!records[contents]) {
      records[contents] = {};
    }

    records[contents][date] = row.checked;
  }

  res.json(records);
});

export default app