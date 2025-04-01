const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Initialize Socket.io
  const io = new Server(server)

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Client connected', socket.handshake.query.userId)
    
    // User authentication
    const userId = socket.handshake.query.userId
    if (!userId) {
      socket.disconnect()
      return
    }
    
    // Join user-specific room
    socket.join(`user:${userId}`)
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected', userId)
    })
  })

  server.listen(3000, (err) => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})