import mongoose from "mongoose";

const NotesSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'iNotebook_Users'
  },
  title: {
    type: String,
    required: true
  },
  tags: {
    type: String,
    default: 'General'
  },
  description: {
    type: String,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
})

export const NotesModel = mongoose.model('iNotebook_Notes', NotesSchema)