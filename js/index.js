const chatLog = document.getElementById('chat-log')
const message = document.getElementById('message')
const form = document.querySelector('form')
const typing = document.querySelector('.typing')

const messages = []

const addSpeechBubble = (text, role) => {
    const newMessage = { role, content: `${text}` }
    messages.push(newMessage)

    const messageElem = document.createElement('div')
    
    messageElem.classList.add('message')
    messageElem.classList.add('message--sent')
    messageElem.innerHTML = `
        <div class='message__text ${role}'>${text}</div>
    `
    
    chatLog.appendChild(messageElem)
    chatLog.scrollTop = chatLog.scrollHeight;
}


form.onsubmit = e => {
    e.preventDefault()

    typing.classList.remove('hidden')
    
    const messageText = message.value
    message.value = ''
    
    addSpeechBubble(messageText, 'user')

    fetch('http://localhost:3000/prompt', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages
        })
    })
    .then(res => res.json())
    .then(res => {
        typing.classList.add('hidden')
        addSpeechBubble(res.completion.content, 'assistant')
    })
    .catch(err => {
        console.error(err)
        typing.classList.add('hidden')
        addSpeechBubble(
            `I\'m sorry, something seems to have gone wrong with the connection. Please see this error message for more details: ${err}`,
            'assistant'
        )
    })
}
