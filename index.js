var express = require('express');
var app = express()
var path = require('path')
var http = require('http').Server(app);
var io = require('socket.io')(http);
// var userList = [];   future feature - assert whether the user enters repeatedly, and calculate number of room.

app.use(express.static('public'))
app.set('views', path.join(__dirname, './views/'))      // 預設
app.engine('html', require('express-art-template'))

app.get('/', function(req, res) {
   res.render('index.html');
});

app.get('/chat', (req, res) => {
    res.render('chat.html', { query: req.query })
})

io.on('connection', socket => {
    console.log('new socket.io connecttion...')
    socket.emit('message', `歡迎進入聊天室`)

    socket.on('joinRoom', ({ username, room }) => {
        // userList.push(username);
        socket.join(room)
        socket.broadcast.to(room).emit('message', `使用者 ${username} 加入了 ${room} 房間`)
    })
    
    socket.on('chat', data => {
        io.to(data.room).emit('chat', data)
    })

    socket.on('typing', data => {
        socket.broadcast.to(data.room).emit('typing', data)
    })

    socket.on('untyping', data => {
        socket.broadcast.to(data.room).emit('untyping', data)
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A User has left the chat')
    })
})

http.listen(3000, function() {
   console.log('listening on localhost:3000');
});