class MessageService {
    constructor(storageService) {
        this.storage = storageService;
        this.initializeMessages();
    }

    initializeMessages() {
        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }
    }

    sendMessage(data) {
        const messages = this.getMessages();
        const message = {
            id: Date.now(),
            senderId: data.senderId,
            receiverId: data.receiverId,
            content: data.content,
            jobId: data.jobId,
            timestamp: new Date().toISOString(),
            read: false
        };

        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        return message;
    }

    getMessages() {
        return JSON.parse(localStorage.getItem('messages')) || [];
    }

    getConversation(userId1, userId2, jobId) {
        const messages = this.getMessages();
        return messages.filter(msg => 
            (msg.senderId === userId1 && msg.receiverId === userId2 && msg.jobId === jobId) ||
            (msg.senderId === userId2 && msg.receiverId === userId1 && msg.jobId === jobId)
        );
    }

    markAsRead(messageId) {
        const messages = this.getMessages();
        const messageIndex = messages.findIndex(m => m.id === messageId);
        
        if (messageIndex !== -1) {
            messages[messageIndex].read = true;
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }
} 