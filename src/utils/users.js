const sharp = require('sharp')

const users = []

const addUser = ({ id, userName, room }) => {
  userName = userName.trim().toLowerCase()
  room = room.trim().toLowerCase()

  if (!userName || !room) {
    return {
      error: 'Username and Password are required!'
    }
  }

  const existingUser = users.find(
    user => user.room === room && user.userName === userName
  )

  if (existingUser) {
    return {
      error: 'Username is in use!'
    }
  }

  const user = { id, userName, room }

  users.push(user)

  return { user }
}

const removeUser = id => {
  const index = users.findIndex(user => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = id => users.find(user => user.id === id)

const getUserInRoom = room => {
  room = room.trim().toLowerCase()

  return users.filter(user => user.room === room)
}

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUserInRoom
}

// console.log(users)
