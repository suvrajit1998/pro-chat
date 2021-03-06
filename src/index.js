const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const { generateMessage, generateLocationMessage } = require('./utils/messages')

const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/users')

const app = express()

const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', socket => {
  console.log('New webSocket Conneted!')

  socket.on('join', (option, callback) => {
    const { error, user } = addUser({ id: socket.id, ...option })

    if (error) {
      return callback(error)
    }

    socket.join(user.room)

    socket.emit('message', generateMessage('Admit', 'Welcome!'))

    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage('Admin', `${user.userName} has joined!`))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    })

    callback()
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)
    const filter = new Filter({ placeHolder: 'x' })

    const cleanMessage = filter.clean(message)

    io.to(user.room).emit(
      'message',
      generateMessage(user.userName, cleanMessage)
    )
    callback()
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)
    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.userName,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    )
    callback()
  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.userName} has left!`)
      )

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      })
    }
  })
})

server.listen(port, () => {
  console.log(`Server running on ${port}`)
})
