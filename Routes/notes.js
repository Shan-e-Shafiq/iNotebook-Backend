import { Router } from "express";
import { NotesModel } from "../Models/NotesModel.js";
import { fetchuser } from "../Middleware/fetchuser.js";
import { body, validationResult } from "express-validator";

const notes_route = Router()
const validationArray = [
  body('title', 'Enter a valid title').isString().isLength({ min: 3 }),
  body('description', 'Enter a valid description').isString().isLength({ min: 3 })
]


// ########################## ROUTE 1 (/api/notes/fetchallnotes) ###############################

notes_route.get('/fetchallnotes', fetchuser, async (req, res) => {
  try {
    const data = await NotesModel.find({ user: req.user.id })
    res.json({ data: data, msg: 'This is notes' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "internal server error", error: error.message })
  }
})

// ########################## ROUTE 2 (/api/notes/addnotes) ###############################

notes_route.post('/addnotes', fetchuser, validationArray, async (req, res) => {
  try {
    // CHECKING VALIDATIONS
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() })
    }
    // DESTRUCTURING REQUEST BODY
    const { title, description, tags } = req.body
    // ADDING NOTES TO DATABASE
    const data = {
      user: req.user.id,
      title: title,
      description: description,
      tags: tags
    }
    const x = await NotesModel.create(data)
    res.status(200).json(x)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "internal server error", error: error.message })
  }
})

// ########################## ROUTE 3 (/api/notes/updatenotes/:id) ###############################

notes_route.put('/updatenotes/:id', fetchuser, async (req, res) => {
  console.log(req.body)
  try {
    // CHECKING VALIDATIONS
    const result = validationResult(req)
    if (!result.isEmpty()) {
      return res.status(400).json({ error: result.array() })
    }
    // CHECKING IF A NOTE WITH PROVIDED ID EXISTS IN DATABASE
    const found_note = await NotesModel.findOne({ _id: req.params.id })
    if (!found_note) {
      return res.status(404).json({ error: "Notes with this id do not exist" })
    }
    // CHECKING IF THIS NOTE BELONGS TO THE USER WHO HAS SIGNED IN
    if (!req.user.id === found_note.user) {
      return res.status(401).json({ error: "Unauthorised access denied" })
    }
    // DESTRUCTURING UPDATES FROM REQ.BODY
    const { title, description, tags } = req.body
    // CREATING A NEW DATA OBJECT WITH UPDATED DATA
    const UpdatedData = {}
    // IF USER PROVIDES ANY OF THE FOLLOWING INFO, THEN DATA OBJECT IS CREATED ACCORDINGLY
    if (title) { UpdatedData.title = title }
    if (description) { UpdatedData.description = description }
    if (tags) { UpdatedData.tags = tags }
    // UPDATE QUERY
    const queryResult = await NotesModel.updateOne({ _id: req.params.id }, { $set: UpdatedData })
    return res.status(200).json(queryResult)
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "internal server error", error: error.message })
  }
})

// ########################## ROUTE 4 (/api/notes/deletenotes/:id) ###############################

notes_route.delete('/deletenotes/:id', fetchuser, async (req, res) => {
  try {
    // CHECKING IF A NOTE WITH GIVEN ID EXISTS IN DATABASE
    const found_note = await NotesModel.findById(req.params.id)
    if (!found_note) {
      return res.status(404).json({ error: 'This note does not exist' })
    }
    // CHECKING IF THE NOTE BEING DELETED BELONGS TO THE SAME USER WHO HAS SIGNED IN
    if (req.user.id === found_note.id) {
      return res.status(400).json({ error: 'Bad request' })
    }
    // USING DELETION QUERY
    const queryResult = await NotesModel.deleteOne({ _id: found_note.id })
    return res.status(200).json(queryResult)
  } catch (error) {
    return res.status(500).json({ msg: "internal server error", error: error.message })
  }
})

export { notes_route }