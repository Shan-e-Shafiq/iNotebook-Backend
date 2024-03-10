import express from "express";
import { connect_to_database } from "./db.js";
import { auth_route } from "./Routes/auth.js";
import { notes_route } from "./Routes/notes.js";
import dotenv from "dotenv"
import cors from "cors";

const app = express()
dotenv.config()

// MIDDLEWARE
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

// AVAILABLE ROUTES
app.use('/api/auth', auth_route)
app.use('/api/notes', notes_route)
app.get('/', async (req, res) => {
  let db = await connect_to_database()
  res.status(200).json({ 'msg': "SERVER IS UP", "db": db })
})

const port = process.env.PORT || 3000;

app.listen(port, async () => {
  console.log('Listening on port:' + port)
})


