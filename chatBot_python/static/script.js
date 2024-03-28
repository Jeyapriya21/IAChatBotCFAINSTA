// fonction pour le voice record
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
//fonction 
function sendMessage() {
    var userMessage = document.getElementById("user-input").value.trim();
    if (userMessage) {
        document.getElementById("chat-display").innerHTML += `<div class='message user_message'><div class='message_bubble'><img src='../static/images/userChat.png'><p>${userMessage}</p></div></div>`;
        document.getElementById("user-input").value = "";
        fetch("/get?msg=" + userMessage)
            .then(response => response.text())
            .then(data => {
                document.getElementById("chat-display").innerHTML += `<div class='message bot_message'><div class='bubble_bot'><img src='../static/images/bot.png'><p>${data}</p></div><div class="message-options">
                <button class="dislike-btn" onclick="dislikeResponse('${data}')"><img src="../static/images/dislike.png" alt="dislike" class="message-image">
                </button>
            </div></div>`;
                // dislikeResponseMsg();
                scrollToBottom(); // Scroll to bottom after adding the message
            });
        document.getElementById('chat-container').scrollIntoView();
    }

}

function scrollToBottom() {
    const chatDisplay = document.getElementById("chat-display");
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

// JavaScript code for sending dislike feedback
function dislikeResponse(res) {
    fetch('/dislike', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disliked: true, response: res })
    })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}

function dislikeResponseMsg() {
    const dislikeButtons = document.querySelectorAll('.dislike-btn');
    dislikeButtons.forEach(button => {
        button.addEventListener('click', function () {
            const message = this.parentElement;
            message.classList.add("dislikeResponse")
        })
    })
}

