// const multer = require('multer')

const socket = io()

const $message = document.querySelector('#message')
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

const autoScroll = () => {
  //new message element
  const $newMessage = $message.lastElementChild

  //new message element height
  const $newMessageStyle = getComputedStyle($newMessage)
  const $newMessageMargin = parseInt($newMessageStyle.marginBottom)
  const $newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

  //visible height
  const visibleHeight = $message.offsetHeight

  //height of the message container
  const containerHeight = $message.scrollHeight

  //how for have i scrolled
  const scrollOffset = $message.scrollTop + visibleHeight

  if (containerHeight - $newMessageHeight <= scrollOffset) {
    $message.scrollTop = $message.scrollHeight
  }
}

socket.on('message', message => {
  console.log(message)

  const html = Mustache.render(messageTemplate, {
    userName: message.userName,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:m a')
  })
  $message.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('locationMessage', url => {
  console.log(url)

  const html = Mustache.render(locationMessageTemplate, {
    userName: url.userName,
    url: url.text,
    createdAt: moment(url.createdAt).format('h:m a')
  })

  $message.insertAdjacentHTML('beforeend', html)
  autoScroll()
})

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })

  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', e => {
  e.preventDefault()

  $messageFormButton.setAttribute('disabled', 'desabled')

  const message = e.target.elements.message.value

  socket.emit('sendMessage', message, error => {
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

    if (error) {
      return console.log(error)
    }

    console.log('message delivered!')
  })
})

$sendLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your Browser!')
  }

  $sendLocation.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        $sendLocation.removeAttribute('disabled')
        console.log('Location Sheared!')
      }
    )
  })
})

socket.emit('join', { userName, room }, error => {
  if (error) {
    alert(error)
    location.href = '/'
  }
})
