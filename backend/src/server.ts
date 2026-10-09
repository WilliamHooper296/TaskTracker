import express from 'express'
import cors from 'cors'
import pool from './db.js'
import { readFile } from 'node:fs/promises'
import { exitCode } from 'node:process'

const app = express()

app.use(express.json())
app.use(cors())

const retrieveUserDailyQuery = await readFile('sql/004_retrieve_user_daily.sql', 'utf-8')
const retrieveUserGoalsQuery = await readFile('sql/005_retrieve_user_goals.sql', 'utf-8')
const swapDailyCheckedQuery = await readFile('sql/006_swap_daily_checked.sql', 'utf-8')
const swapGoalsCheckedQuery = await readFile('sql/007_swap_goals_checked.sql', 'utf-8')
const createDailyQuery = await readFile('sql/008_create_daily.sql', 'utf-8')
const createGoalsQuery = await readFile('sql/009_create_goals.sql', 'utf-8')
const removeDailyQuery = await readFile('sql/010_remove_daily.sql', 'utf-8')
const removeGoalQuery = await readFile('sql/011_remove_goal.sql', 'utf-8')

app.post('/add/daily', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const input = req.body['name']
    const complete = req.body['complete']

    await pool.query(createDailyQuery, [UserId, input, false, complete])

    res.json({ status: 'SUCCESS' })
})

app.put('/swap/daily', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const daily_id = req.body['daily_id']
    
    await pool.query(swapDailyCheckedQuery, [daily_id])

    res.json({ status: 'SUCCESS' })

})

app.get('/lists/daily', async (req, res) => {
    const id = req['headers'].user_id
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const result = await pool.query(retrieveUserDailyQuery, [UserId])

    res.json({ list: result.rows })

})

app.delete('/lists/daily', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const daily_id = req.body['daily_id']


    await pool.query(removeDailyQuery, [daily_id])

    res.json({ status: 'SUCCESS'})
})

app.post('/add/goal', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const input = req.body['name']

    await pool.query(createGoalsQuery, [UserId, input, false])

    res.json({ status: 'SUCCESS' })
})

app.put('/swap/goals', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const goal_id = req.body['goal_id']
    
    await pool.query(swapGoalsCheckedQuery, [goal_id])

    res.json({ status: 'SUCCESS' })

})

app.get('/lists/goals', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const result = await pool.query(retrieveUserGoalsQuery, [UserId])

    res.json({ list: result.rows })

})

app.delete('/lists/goals', async (req, res) => {
    const id = req.headers['user_id']
    const UserId = parseInt(typeof id == 'string' ? id : '0', 10)

    const goal_id = req.body['goal_id']

    await pool.query(removeGoalQuery, [goal_id])

    res.json({ status: 'SUCCESS'})
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
