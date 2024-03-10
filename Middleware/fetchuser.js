import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()

export const fetchuser = (req, res, next) => {
  try {
    const data = jwt.verify(req.header('auth_token'), `${process.env.JWT_SECRET}`)
    if (!data) {
      return res.status(401).json({ error: 'Please provide a valid authentication token' })
    }
    req.user = data
    next()
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
