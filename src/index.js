const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessages ,generateLocationMessages } = require('./utils/messages');
const { addUser,removeUser,getUser,getUserInRoom } = require('./utils/users')

const app = express();
//if we don't create servre manually express create it in backend but her when we create the io instance using socket.io we have to npass tyhe servre so that...
const servre = http.createServer(app)
const io = socketio(servre)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//let count = 0

//flow of app
// server (emit) => client (receive) - countUpdated
// client (emit) => server (receive) - increment

io.on('connection',(socket) => {
    console.log('New Websocket connection');

    //here it will send the current count value to the client who is newly joined ,, we are not using the io.emit becouse we don't want that when every new client joins the count value has been send to each and every client exist in the connection 
    // socket.emit('countUpdated',count)
    
    // socket.on('increment',() => {
    //     count++

        //this emit the connection to specific client in the network
        //socket.emit('countUpdated',count )

        //this emit the connection to every single client connected to this app
        // io.emit('countUpdated',count)
    //})

    socket.on('join',({username ,room},callback)=> {
        const { error , user} = addUser({ id : socket.id , username , room})
        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message',generateMessages(`Welsome to this chat ! ${user.username}`))
        socket.broadcast.to(room).emit('message',generateMessages(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room : user.room,
            users : getUserInRoom(user.room)
        })


        callback()

    }) 
    socket.on('sendMessage',(msg,callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('profanity is not allowed!!')
        }
        socket.emit('message',generateMessages(user.username,msg))       
        socket.broadcast.to(user.room).emit('messagetoOthers',generateMessages(user.username,msg))
        callback()
    })

    socket.on('disconnect', () => {
        const  user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('messagetoOthers',generateMessages(`${user.username} has left !!!`))
            io.to(user.room).emit('roomData',{
                room : user.room,
                users : getUserInRoom(user.room)
            })
    
        }
    })

    socket.on('sendLocation', (coords,callback) => {
        const user = getUser(socket.id)
        socket.emit('locationMessage',generateMessages(user.username,`https://google.com/maps?q=${coords.latitude},${coords.latitude}`))       
        socket.broadcast.to(user.room).emit('locationMessagetoOthers',generateMessages(user.username,`https://google.com/maps?q=${coords.latitude},${coords.latitude}`))
        callback()
    })
})

servre.listen(port, () => {
    console.log(`server is running at port ${port}!!`);
})


//socket.emit : send a event to specific client (to client it self who joined )
//io.emit :  send an event to every connecte client
//socket.broadcast.emit : send an event to every connecte client except it self
//socket.broadcast.to().emit : send an event to exverone except it sleft but the new thing is that to() is limiting it to specific chat room
//io.to().emit :  send an event to every connecte client but limitng it to specific chat room