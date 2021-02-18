require('dotenv').config()
const express = require('express')
const cors = require('cors')

const Note = require('./models/note')

const app = express() 
app.use(cors())
app.use(express.static('build'))
app.use(express.json()) // data send from frontend (ie in a the body of POST request) is in JSON format, so we need express to parse the JSON

// middleware 

const unknownEndpoint = (request, response) => { // middleware
  response.status(404).send('error: unknown endpoint')
}

const errorHandler = (error, request, response, next) => { // express error-handlers are middleware (like all middleware the error-handler accepts parameters 'req', 'res', and, 'next'); it also accepts 'error' as the first parameter because error-first callback pattern is a convention in node
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 
  next(error) // here 'next' is the default express error-handler; this handler only handles 'CastError' errors and passes every other kind of error on to the next middleware
}

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}
app.use(requestLogger)
// request handlers

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
    return response.json(notes)
  })
})

app.get('/api/notes/:id', (request, response, next) => { 
  Note.findById(request.params.id) // should this be converted into a number?
  .then(note => { // promise returned by findById resolved/fulfilled
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error)) // pass error to error-handling middleware (ie errorHandler defined in line 36)
})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(request.params.id, note, { new: true }) // the last argument passed into findByIdAndUpdate makes it so that the modified document is returned and not the original 
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint) // middleware added after all routes are defined because you only want to use this when everything else doesn't work

app.use(errorHandler) 

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)