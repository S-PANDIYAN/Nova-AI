// Nova AI - Modern ChatGPT-inspired Interface
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nova AI initialized');
    
    // Initialize event listeners
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    if (chatForm) {
        chatForm.addEventListener('submit', handleSubmit);
    }
    
    if (chatInput) {
        chatInput.addEventListener('input', autoResizeTextarea);
        chatInput.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit(e);
            }
        });
    }
    
    // New chat button
    const newChatBtn = document.getElementById('newChatBtn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    
    // Test server connection
    testConnection();
});

function testConnection() {
    fetch('/test')
        .then(response => response.json())
        .then(data => {
            console.log('Server connection test:', data);
        })
        .catch(error => {
            console.error('Server connection failed:', error);
            showError('Cannot connect to server. Please check if the Flask app is running.');
        });
}

function autoResizeTextarea() {
    const textarea = document.getElementById('chatInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function startNewChat() {
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.innerHTML = '';
        addMessage('assistant', 'Hello! I\'m Nova AI, your intelligent assistant. How can I help you today?');
    }
}

function addMessage(role, content) {
    console.log(`Adding ${role} message:`, content);
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) {
        console.error('Chat messages container not found');
        return;
    }
    
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const messageAvatar = document.createElement('div');
    messageAvatar.className = 'message-avatar';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageText = document.createElement('div');
    messageText.className = 'message-text';
    messageText.innerHTML = formatText(content);
    
    if (role === 'assistant') {
        messageAvatar.innerHTML = `
            <div class="ai-avatar">
                <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <defs>
                        <linearGradient id="avatarGradient${Date.now()}" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#667eea"/>
                            <stop offset="100%" stop-color="#764ba2"/>
                        </linearGradient>
                    </defs>
                    <circle cx="32" cy="32" r="30" fill="url(#avatarGradient${Date.now()})"/>
                    <path d="M20 20h24c2.2 0 4 1.8 4 4v12c0 2.2-1.8 4-4 4H28l-6 6v-6h-2c-2.2 0-4-1.8-4-4V24c0-2.2 1.8-4 4-4z"
                        stroke="white" stroke-width="2" fill="none"/>
                    <circle cx="24" cy="28" r="2" fill="white"/>
                    <circle cx="32" cy="28" r="2" fill="white"/>
                    <circle cx="40" cy="28" r="2" fill="white"/>
                </svg>
            </div>
        `;
    } else {
        messageAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    messageContent.appendChild(messageText);
    messageDiv.appendChild(messageAvatar);
    messageDiv.appendChild(messageContent);
    messageGroup.appendChild(messageDiv);
    
    chatMessages.appendChild(messageGroup);
    
    // Scroll to bottom
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function formatText(text) {
    if (!text) return '';
    
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

function showTypingIndicator() {
    console.log('Showing typing indicator');
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message assistant typing';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <div class="ai-avatar">
                <svg width="24" height="24" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none">
                    <defs>
                        <linearGradient id="typingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#667eea"/>
                            <stop offset="100%" stop-color="#764ba2"/>
                        </linearGradient>
                    </defs>
                    <circle cx="32" cy="32" r="30" fill="url(#typingGradient)"/>
                </svg>
            </div>
        </div>
        <div class="message-content">
            <div class="message-text">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

function removeTypingIndicator() {
    console.log('Removing typing indicator');
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function showError(message) {
    console.error('Error:', message);
    
    const notification = document.createElement('div');
    notification.className = 'error-message';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 400px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

async function sendMessageToServer(message) {
    console.log('Sending message to server:', message);
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Response data:', data);
        
        return data.response;
        
    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}

async function handleSubmit(e) {
    if (e) e.preventDefault();
    
    console.log('Form submitted');
    
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    
    if (!input) {
        console.error('Chat input not found');
        return;
    }
    
    const message = input.value.trim();
    console.log('Message to send:', message);
    
    if (!message) {
        console.log('Empty message, not sending');
        return;
    }
    
    // Disable input
    input.disabled = true;
    if (sendButton) sendButton.disabled = true;
    
    // Add user message
    addMessage('user', message);
    
    // Clear input
    input.value = '';
    input.style.height = 'auto';
    
    try {
        // Show typing indicator
        showTypingIndicator();
        
        // Send to server
        const response = await sendMessageToServer(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        // Add AI response
        if (response) {
            addMessage('assistant', response);
        } else {
            throw new Error('No response received from server');
        }
        
    } catch (error) {
        removeTypingIndicator();
        showError(`Sorry, there was an error: ${error.message}`);
    } finally {
        // Re-enable input
        input.disabled = false;
        if (sendButton) sendButton.disabled = false;
        input.focus();
    }
}
