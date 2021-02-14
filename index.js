const express = require('express')
const cors = require('cors')
const app = express() // commonjs module import

app.use(cors())
app.use(express.json()) // data send from frontend (ie in a the body of POST request) is in JSON format, so we need express to parse the JSON

let notes = [ // primary purpose of backend server is to pass JSON format data to frontend; JSON data is a string
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }
]

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

app.get('/', (request, response) => { 
  response.send('<h1>Hello World!</h1>') // sent with Content-Type: text/html; express sets this header automatically
})

app.get('/api/notes', (request, response) => {
  response.json(notes) // sent with sent with Content-Type: application/json header; express automatically stringifies the notes data is a javascript array so it can be sent as json
})

const unknownEndpoint = (request, response) => { // middleware
  response.status(404).send('error: unknown endpoint')
}

app.use(unknownEndpoint) // middleware added after all routes are defined beacause it is used for catching requests made to non-existent routes

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)