<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Group Chat</title>
</head>
<body>
    <h1>Group Chat</h1>
    <div id="new-user-form">
        <div id="exists-error" style="color:red"></div>
        <input type="text" id="name" placeholder="Enter your name">
        <button type="button" onclick="setUserName()">Chat with Users</button>
    </div>

    <!-- Include Socket.IO library -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.5/socket.io.js"></script>

    <script>
        const socket = io('http://localhost:4000');
        let user;

        function setUserName() {
            const userName = document.getElementById('name').value;
            if (userName === '') {
                alert('Please enter your name!');
            } else {
                socket.emit('setUserName', userName);
            }
        }

        socket.on('usersExists', (data) => {
            document.getElementById('exists-error').innerHTML = data;
        });

        socket.on('setUser', (data) => {
            user = data.username;
            document.getElementById('new-user-form').innerHTML =
                '<input type="text" id="message" placeholder="Enter your message">\
                <button type="button" onclick="sendMessage()">Send</button>\
                <div id="messages-container"></div>';
        });

        function sendMessage() {
            const message = document.getElementById('message').value;
            if (message === '') {
                alert('Please enter a message!');
                return;
            }
            socket.emit('msg', { user: user, message: message });
            document.getElementById('message').value = ''; // Clear the input field after sending
        }

        socket.on('newmsg', (data) => {
            if (user) {
                document.getElementById('messages-container').innerHTML += 
                    '<div>' +
                    '<b>' + data.user + '</b>: ' + data.message +
                    '</div>';
            }
        });
    </script>
</body>
</html>
