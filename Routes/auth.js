import { Router } from "express";
import { UserModel } from "../Models/UsersModel.js";
import { body, validationResult } from "express-validator";
import { fetchuser } from "../Middleware/fetchuser.js";
import * as bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import dotenv from "dotenv"


dotenv.config()
const auth_route = Router()
const validationArray = [
  body('name', 'Please type a valid name').isString().isLength({ min: 3 }),
  body('email', 'Please enter a valid email address').isEmail(),
  body('password', 'Password should be alteast 6 characters').isLength({ min: 6 })
]

// ########################## ROUTE 1 (/api/auth/createuser) ###############################

auth_route.post('/createuser', validationArray, async (req, res) => {
  try {
    // IF USER CREDENTIALS ARE NOT VALID
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() })
    }
    // CHECKING IF A USER WITH SAME EMAIL ALREADY EXISTS IN DATABASE
    const result = await UserModel.findOne({ email: req.body.email })
    if (result) {
      return res.status(400).json({ error: 'User with this email already exists' })
    }
    // ADDING SALT AND HASHING PASSWORD TO ENHANCE SECURITY
    const salt = await bcrypt.genSalt(10)
    const securePassword = await bcrypt.hash(req.body.password, salt)
    req.body.password = securePassword
    // INSERTING DATA IN DATBASE
    const user = await UserModel.create(req.body)
    // SENDING AUTH TOKEN TO THE USER
    const data = { id: user.id }
    const authtoken = jwt.sign(data, `${process.env.JWT_SECRET}`);
    return res.status(200).json({ authtoken: authtoken })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ msg: "internal server error", error: err.message })
  }
})

const LoginValidationArray = [
  body('email', 'Please enter a valid email').isEmail(),
  body('password', 'Password should contain atleast 6 characters').isLength({ min: 6 })
]

// ########################## ROUTE 2 (/api/auth/login) ###############################

auth_route.post('/login', LoginValidationArray, async (req, res) => {
  try {
    // IF CREDENTIALS ARE WRONG
    let error = validationResult(req)
    if (!error.isEmpty) {
      return res.status(400).json({ error: error.array() })
    }
    // DESTRUCTURING PROVIDED CREDENTIALS AS LOGIN PAGE
    const { email, password } = req.body
    // CHECKING WHETHER USER EXISTS IN DATABASE OR NOT
    let found_user = await UserModel.findOne({ email: email })
    if (!found_user) {
      return res.status(404).json({ error: "Please provide correct credentials" })
    }
    // IF USER EXISTS, MATCH THE PASSWORD IN DATABASE 
    const passwordCompare = await bcrypt.compare(password, found_user.password)
    if (!passwordCompare) {
      // IF PASSWORD DOESN'T MATCH
      return res.status(400).json({ error: "Please provide correct credentials" })
    }
    // SENDING AUTH TOKEN TO USER
    const data = { id: found_user.id }
    const authtoken = jwt.sign(data, `${process.env.JWT_SECRET}`)
    return res.status(200).json({ msg: 'Login successful', authtoken: authtoken })
  } catch (err) {
    return res.status(500).json({ msg: "internal server error", error: err.message })
  }
})

// ########################## ROUTE 3 (/api/auth/getuser) ###############################

auth_route.post('/getuser', fetchuser, async (req, res) => {
  try {
    const userID = req.user.id
    // const x = await UserModel.findById(userID).select('-password') 
    const x = await UserModel.find({ _id: userID }, { password: 0 })
    return res.status(200).json(x)
    // console.log(x)
  } catch (error) {
    console.log(error)
  }
})

export { auth_route }