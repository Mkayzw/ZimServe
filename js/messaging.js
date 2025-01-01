class MessageService {
    constructor(storageService) {
        this.storage = storageService;
        this.callbacks = new Map();
        this.initializeMessages();
        this.setupMessagePolling();
        this.currentUser = null;
        this.activeConversation = null;
    }

    initializeMessages() {
        try {
            if (!localStorage.getItem('messages')) {
                localStorage.setItem('messages', JSON.stringify([]));
            }
            if (!localStorage.getItem('conversations')) {
                localStorage.setItem('conversations', JSON.stringify({}));
            }
        } catch (error) {
            console.error('Error initializing messages:', error);
            throw new Error('Failed to initialize message storage');
        }
    }

    setupMessagePolling() {
        // Poll for new messages every 3 seconds
        setInterval(() => this.checkNewMessages(), 3000);
    }

    checkNewMessages() {
        if (!this.currentUser) return;
        
        const messages = this.getMessages();
        const newMessages = messages.filter(msg => 
            msg.receiverId === this.currentUser.id && 
            !msg.read &&
            (!this.lastCheck || new Date(msg.timestamp) > this.lastCheck)
        );

        if (newMessages.length > 0) {
            this.notifyNewMessages(newMessages);
        }

        this.lastCheck = new Date();
    }

    notifyNewMessages(messages) {
        // Trigger new message callback if registered
        if (this.callbacks.has('newMessage')) {
            this.callbacks.get('newMessage')(messages);
        }

        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
            messages.forEach(msg => {
                new Notification('New Message', {
                    body: msg.content.substring(0, 50) + '...',
                    icon: '/favicon/favicon.ico'
                });
            });
        }
    }

    async sendMessage(data) {
        try {
            if (!data.content?.trim()) {
                throw new Error('Message content cannot be empty');
            }

            const message = {
                id: Date.now(),
                senderId: data.senderId,
                receiverId: data.receiverId,
                content: this.sanitizeMessage(data.content),
                jobId: data.jobId,
                timestamp: new Date().toISOString(),
                read: false,
                delivered: false,
                type: data.type || 'text'
            };

            const messages = this.getMessages();
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));

            // Update conversation
            this.updateConversation(message);

            // Simulate network delay and delivery status
            await new Promise(resolve => setTimeout(resolve, 500));
            this.markAsDelivered(message.id);

            return message;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to send message');
        }
    }

    sanitizeMessage(content) {
        // Basic XSS prevention
        return content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    updateConversation(message) {
        const conversations = JSON.parse(localStorage.getItem('conversations')) || {};
        const conversationId = this.getConversationId(message.senderId, message.receiverId, message.jobId);
        
        if (!conversations[conversationId]) {
            conversations[conversationId] = {
                participants: [message.senderId, message.receiverId],
                jobId: message.jobId,
                lastMessage: message,
                updatedAt: message.timestamp
            };
        } else {
            conversations[conversationId].lastMessage = message;
            conversations[conversationId].updatedAt = message.timestamp;
        }

        localStorage.setItem('conversations', JSON.stringify(conversations));
    }

    getMessages() {
        try {
            return JSON.parse(localStorage.getItem('messages')) || [];
        } catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    }

    getConversations() {
        try {
            const conversations = JSON.parse(localStorage.getItem('conversations')) || {};
            return Object.values(conversations).sort((a, b) => 
                new Date(b.updatedAt) - new Date(a.updatedAt)
            );
        } catch (error) {
            console.error('Error getting conversations:', error);
            return [];
        }
    }

    getConversationId(userId1, userId2, jobId) {
        return `${Math.min(userId1, userId2)}-${Math.max(userId1, userId2)}-${jobId}`;
    }

    getConversation(userId1, userId2, jobId) {
        try {
            const messages = this.getMessages();
            return messages.filter(msg => 
                (msg.senderId === userId1 && msg.receiverId === userId2 && msg.jobId === jobId) ||
                (msg.senderId === userId2 && msg.receiverId === userId1 && msg.jobId === jobId)
            ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        } catch (error) {
            console.error('Error getting conversation:', error);
            return [];
        }
    }

    markAsRead(messageId) {
        try {
            const messages = this.getMessages();
            const messageIndex = messages.findIndex(m => m.id === messageId);
            
            if (messageIndex !== -1) {
                messages[messageIndex].read = true;
                localStorage.setItem('messages', JSON.stringify(messages));
                
                if (this.callbacks.has('messageRead')) {
                    this.callbacks.get('messageRead')(messages[messageIndex]);
                }
            }
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    markAsDelivered(messageId) {
        try {
            const messages = this.getMessages();
            const messageIndex = messages.findIndex(m => m.id === messageId);
            
            if (messageIndex !== -1) {
                messages[messageIndex].delivered = true;
                localStorage.setItem('messages', JSON.stringify(messages));
                
                if (this.callbacks.has('messageDelivered')) {
                    this.callbacks.get('messageDelivered')(messages[messageIndex]);
                }
            }
        } catch (error) {
            console.error('Error marking message as delivered:', error);
        }
    }

    setCurrentUser(user) {
        this.currentUser = user;
    }

    setActiveConversation(userId, jobId) {
        this.activeConversation = { userId, jobId };
    }

    on(event, callback) {
        this.callbacks.set(event, callback);
    }

    off(event) {
        this.callbacks.delete(event);
    }
} 