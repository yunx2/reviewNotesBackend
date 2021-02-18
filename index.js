
// starts entire app
const app = require('./app') 
const http = require('http')
const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => { // create server
  logger.info(`Server running on port ${config.PORT}`)
})