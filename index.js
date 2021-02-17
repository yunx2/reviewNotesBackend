require('dotenv').config()
const express = require('express')
const cors = require('cors')

const Note = require('./models/note')

const app = express() // commonjs module import
app.use(cors())
app.use(express.static('build'))
app.use(express.json()) // data send from frontend (ie in a the body of POST request) is in JSON format, so we need express to parse the JSON

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

const unknownEndpoint = (request, response) => { // middleware
  response.status(404).send('error: unknown endpoint')
}

app.use(unknownEndpoint) // middleware added after all routes are defined beacause it is used for catching requests made to non-existent routes

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)