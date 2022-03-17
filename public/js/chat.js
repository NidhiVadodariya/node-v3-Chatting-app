const socket = io()
// const Qs = require('qs');
// socket.on('countUpdated', (count) => {
//     console.log('the count has been updated' , count);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('clciked...');
//     socket.emit('increment')
// })

$messageForm = document.querySelector('#message-form')
$messageFormInput = $messageForm.querySelector('input')
$messageFormButton = $messageForm.querySelector('button')
$sendLocationButton = document.querySelector('#send-location') 
$messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messagetoOthersTemplate = document.querySelector('#message-other-template').innerHTML
const locationMessageTemplete = document.querySelector('#location-message-template').innerHTML
const locationMessageTempleteOthers = document.querySelector('#location-message-template-others').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room} = Qs.parse(location.search , {ignoreQueryPrefix : true})

const autoscroll = () => {
    //new message element
    const $newMessage = $messages.lastElementChild
    
    //height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight  = $messages.scrollHeight

    //how far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight 

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }
    
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('D MMM hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('messagetoOthers', (message) => {
    console.log(message);
    const html = Mustache.render(messagetoOthersTemplate,{
        username : message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('D MMM hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTemplete,{
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('D MMM hh:mm a')        
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessagetoOthers', (message) => {
    console.log(message);
    const html = Mustache.render(locationMessageTempleteOthers,{
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('D MMM hh:mm a')        
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users}) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e) => {
    e.preventDefault()

    //after submiting form disabled button 
    $messageFormButton.setAttribute('disabled','disabled')
    
    //const message = document.querySelector('input').value
    //more secure way to get the eleemnt data value is alternative of above statment 

    const textMessage = e.target.elements.message.value

    socket.emit('sendMessage',textMessage, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error);
        }
        console.log('Message delivered');
    })
})

$sendLocationButton.addEventListener('click',() => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by this browser')
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longtitude : position.coords.longitude
        }, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared!!');
        })
    })
})

socket.emit('join', {username,room} ,(error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

