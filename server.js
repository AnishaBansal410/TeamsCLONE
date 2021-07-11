const { RSA_NO_PADDING } = require('constants');
const express = require('express'); // import the module express
const app = express(); // create an express application
const server = require("http").Server(app);
const io = require('socket.io')(server);

// const {
//   userJoin,
//   getCurrentUser,
//   userLeave,
//   getRoomUsers
// } = require('./utils/users');



const {v4 : uuidv4 } = require('uuid');
const {ExpressPeerServer} = require('peer');
const peerServer = ExpressPeerServer(server , {
  debug : true 
});
app.set('view engine','ejs');
app.use(express.static('public'));
app.use('/peerjs',peerServer);
app.get('/',(req,res) => {
  
  res.redirect (`/${uuidv4()}`);

})

app.get('/:room',(req,res) => {
 
  res.render('room' , {roomId : req.params.room})

})


io.on('connection' , socket => {

  socket.on('join-room' , (userId ,roomId)  => {

      // const user = userJoin(socket.id, userId, roomId);

      const id=userId;
      socket.join(roomId);
      socket.to(roomId).emit('user-connected',userId);
      
      socket.on('message',  message =>{
        io.to(roomId).emit('createMessage', userId ,message)

      });


      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId);
      })


  
  })

})



server.listen(process.env.PORT||3030);
