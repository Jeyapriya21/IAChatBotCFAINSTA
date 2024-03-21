let recognizing = false;
let recognition = null;

function toggleVoiceRecognition() {
    recognizing = !recognizing;
    if (recognizing) {
        startRecognition();
    } else {
        stopRecognition();
    }
}

function startRecognition() {
    if (!recognition) {
        recognition = new window.webkitSpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.interimResults = false;

        recognition.onresult = function (event) {
            const result = event.results[0][0].transcript;
            document.getElementById("user-input").value = result;
            sendMessage(); // Automatically send the recognized speech
        }
    }
    recognition.start();
}

function stopRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

//fonction toggleChat
function toggleChat() {
    var chatDisplay = document.getElementById("chat-container");
    chatDisplay.classList.toggle("show_chat");
}

function sendMessage() {
    const userMessage = document.getElementById("user-input").value.trim();
    if (userMessage) {
        document.getElementById("chat-display").innerHTML += `<div class='message user_message'><div class='message_bubble'><img src='../static/images/userChat.png'><p>${userMessage}</p></div></div>`;
        document.getElementById("user-input").value = ''; // Clear input after sending
        fetch("/get?msg=" + userMessage)
            .then(response => response.text())
            .then(data => {
                document.getElementById("chat-display").innerHTML += `<div class='message bot_message'><div class='bubble_bot'><img src='../static/images/robot.png'><p>${data}</p></div><button onclick="dislikeResponse()">Dislike</button></div>`;
            });
            document.getElementById('chat-container').scrollIntoView();
    }
}

function dislikeResponse() {
    // Send dislike feedback to the server
    fetch("/dislike", {
        method: "POST",
        body: JSON.stringify({ disliked: true }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(response => {
        if (response.ok) {
            console.log("Dislike feedback sent successfully.");
        } else {
            console.error("Failed to send dislike feedback.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

