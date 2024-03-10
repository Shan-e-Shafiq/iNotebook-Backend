import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const mongodb_URI = process.env.MONGODB_URI

function connect_to_database() {
  return new Promise((resolve, reject) => {
    try {
      mongoose.connect(mongodb_URI)
      resolve('Connected...')
    } catch (error) {
      reject(error)
    }
  })
}

export {
  connect_to_database
}
