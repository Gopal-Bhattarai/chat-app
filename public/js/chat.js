const socket = io()
//DOM ELEMENTS
const sendBtn = document.querySelector('#send')
const msgForm = document.querySelector('#message-form')
const textbox = document.querySelector('#textbox')
const sendLocation = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options (query)
const { username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//auto-scroll
const autoscroll =() => {
    //new msg element
    const newMessage = messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = messages.offsetHeight

    //Height of messages container
    const containerHeight = messages.scrollHeight

    //how far have i scrolled?
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message', (message) =>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        message: message.message,
        username: message.username,
        createdAt: moment(message.createdAt).format('MMM-DD h:mm:ss a')   
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log(url);
    const html = Mustache.render(locationMessageTemplate, {
        url:url.url,
        username: url.username,
        createdAt: moment(url.createdAt).format('MMM-DD h:mm:ss a')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

msgForm.addEventListener('submit',(e) => {
    e.preventDefault()
    const textboxValue = textbox.value;
    //disable double click
    sendBtn.setAttribute('disabled','disabled')
    textbox.value = ''
    textbox.focus()

    socket.emit('sendMessage', textboxValue, (error) =>{
        //enable same element
        sendBtn.removeAttribute('disabled')
        
        if(error) {
            return console.log(error);
        }
        console.log(error);
    })
})

sendLocation.addEventListener('click',(e) => {
    e.preventDefault()
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    sendLocation.setAttribute('disabled',true)

    navigator.geolocation.getCurrentPosition((position)=>{
        const locationObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation',locationObj, ()=>{
            console.log('Location shared');
            sendLocation.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room }, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})