const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

// const { username, room } = qs.parse(location.search, {
//     ignoreQueryPrefix: true
// });
  

let myVideoStream ;
const peers = {};
const peer = new Peer( undefined , {

    path: '/peerjs',
    host : '/',
    port : '443'

});


navigator.mediaDevices.getUserMedia({
    video : true,
    audio : true
}).then(stream =>{

    myVideoStream = stream;
    addVideoStream(myVideo,stream);

    peer.on('call', call => {

        call.answer(stream) // Answer the call with an A/V stream.
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {

            addVideoStream(video , userVideoStream)// Show stream in some video/canvas element.

        })
    })
    
    socket.on('user-connected' , (userId) =>{
        setTimeout(function () {
        connectToNewUser(userId, stream);
        },300)
    })
})



socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

peer.on('open' , id => {
    socket.emit('join-room', id ,ROOM_ID );
})



const connectToNewUser = (userId , stream ) =>{
    const call = peer.call (userId , stream)
    const video = document.createElement('video')
    call.on('stream' , userVideoStream => {

        addVideoStream(video , userVideoStream);
    })

    call.on('close', () => {
        video.remove()
    })
    
    peers[userId] = call

}

const addVideoStream = (video,stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',() => {
        video.play();
        video.translate(0, 0); 
        video.scale(-1, 1);
    })
    videoGrid.append(video);
}

// emit the message to all users in the call
let text=$('input')

$('html').keydown((e) =>{

    if(e.which==13 && text.val().length!=0){

        socket.emit('message',text.val());
        text.val('')
    }

});

//receive messages and add to the list
socket.on('createMessage' , function(id ,message) {

    $('.messages').append(`<li class="message"><b><font color="white">${id}</font></b><br/><i>${message}</i></li>`);
    scrollToBottom()
})

// Scroll down the chat window
const scrollToBottom = () =>{

    let d= $('.main__chat__window');
    d.scrollTop(d.prop("scrollHeight"));
}

//Mute our video on button click

const muteUnmute = () =>{

    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if(enabled){
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else{

        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
        
    }
    
}

const setMuteButton = () => {
    const html = `
    <i class="fas fa-microphone" style="font-size:24px;" aria-hidden="true"></i>
    <span style="color:rgb(255, 240, 241) ; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size:small;">Mute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
    <i class="unmute fas fa-microphone-slash" style="font-size:24px;" aria-hidden="true"></i>
    <span style="color:rgb(255, 240, 241) ; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size:small;">Unmute</span>
    `
    document.querySelector('.main__mute__button').innerHTML = html;
}

// Stop and play video on button click

const playStop = () => {
    
    console.log('object')
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
    } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
    <i class="fas fa-video" style="font-size:24px;" aria-hidden="true"></i>
    <span style="color:rgb(255, 240, 241) ; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size:small;">Stop Video</span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash" style="font-size:24px;" aria-hidden="true"></i>
    <span style="color:rgb(255, 240, 241) ; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size:small;">Play Video</span>
    `
    document.querySelector('.main__video__button').innerHTML = html;
}

// close window on leaving meeting

function close_window() {
    if (confirm("Are You Sure to leave this meeting ?")) {
        if(navigator.userAgent.indexOf("Firefox") != -1 || navigator.userAgent.indexOf("Chrome") != -1) {  
            open(location, '_self').close();
            window.location.href="about:blank";  
            window.close();  
        }else {  
        window.opener = null;  
        window.open("", "_self");  
        window.close();  
        open(location, '_self').close();
    }  
    }
}

// hide chatbox on button click

function hide_chat()
{   
    var div = document.querySelector('.main__right');
    console.log(div.style.visibility);
    if(div.style.visibility == 'hidden') {div.style.visibility = 'visible'; $('.main__left').css('min-width', "50%");}
    else{div.style.visibility = 'hidden'; $('.main__left').css('min-width', "100%"); $('.main').css('overflow-x', "hidden")}
}