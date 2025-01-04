class StorageService {
    constructor() {
        // Initialize storage with sample data if empty
        if (!localStorage.getItem('users')) {
            this.addSampleData();
        }
    }

    addSampleData() {
        const users = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                role: 'freelancer',
                skills: ['JavaScript', 'React', 'Node.js'],
                hourlyRate: 50,
                rating: 4.8,
                jobsCompleted: 124,
                totalEarnings: 15000
            },
            {
                id: '2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'password',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
                role: 'client',
                company: 'Tech Corp',
                jobsPosted: 45,
                totalSpent: 25000
            }
        ];

        const jobs = [
            {
                id: '1',
                title: 'React Developer Needed',
                description: 'Looking for an experienced React developer...',
                budget: 5000,
                duration: '3 months',
                skills: ['React', 'JavaScript', 'TypeScript'],
                postedBy: '2',
                postedAt: '2024-01-15T10:00:00Z',
                status: 'open'
            },
            {
                id: '2',
                title: 'Node.js Backend Developer',
                description: 'Need help building a scalable backend...',
                budget: 4000,
                duration: '2 months',
                skills: ['Node.js', 'Express', 'MongoDB'],
                postedBy: '2',
                postedAt: '2024-01-14T15:30:00Z',
                status: 'open'
            }
        ];

        const proposals = [
            {
                id: '1',
                jobId: '1',
                freelancerId: '1',
                coverLetter: 'I am very interested in this position...',
                proposedAmount: 4800,
                estimatedDuration: '2.5 months',
                status: 'pending',
                submittedAt: '2024-01-16T09:15:00Z'
            }
        ];

        const conversations = [
            {
                id: '1',
                participants: ['1', '2'],
                jobId: '1',
                name: 'React Developer Position Discussion',
                status: 'active',
                lastMessage: 'Thanks for your interest in the position.',
                lastMessageAt: '2024-01-16T10:00:00Z',
                unreadCount: {
                    '1': 1,
                    '2': 0
                }
            }
        ];

        const messages = [
            {
                id: '1',
                conversationId: '1',
                senderId: '2',
                content: 'Hi John, thanks for applying to the React Developer position.',
                timestamp: '2024-01-16T09:30:00Z',
                read: true
            },
            {
                id: '2',
                conversationId: '1',
                senderId: '1',
                content: "Thank you for considering my application. I am very excited about this opportunity.",
                timestamp: '2024-01-16T09:45:00Z',
                read: true
            },
            {
                id: '3',
                conversationId: '1',
                senderId: '2',
                content: 'Your experience looks great. When would you be available for a technical interview?',
                timestamp: '2024-01-16T10:00:00Z',
                read: false
            }
        ];

        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('jobs', JSON.stringify(jobs));
        localStorage.setItem('proposals', JSON.stringify(proposals));
        localStorage.setItem('conversations', JSON.stringify(conversations));
        localStorage.setItem('messages', JSON.stringify(messages));
    }

    // User methods
    getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }

    getCurrentUser() {
        const userId = localStorage.getItem('currentUser');
        if (!userId) return null;
        
        const users = this.getUsers();
        return users.find(user => user.id === userId) || null;
    }

    getUserById(userId) {
        const users = this.getUsers();
        return users.find(user => user.id === userId) || null;
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            localStorage.setItem('currentUser', user.id);
            return user;
        }
        return null;
    }

    logout() {
        localStorage.removeItem('currentUser');
    }

    // Job methods
    getJobs() {
        return JSON.parse(localStorage.getItem('jobs') || '[]');
    }

    getJobById(jobId) {
        const jobs = this.getJobs();
        return jobs.find(job => job.id === jobId);
    }

    // Proposal methods
    getProposals() {
        return JSON.parse(localStorage.getItem('proposals') || '[]');
    }

    getProposalsByFreelancerId(freelancerId) {
        const proposals = this.getProposals();
        return proposals.filter(proposal => proposal.freelancerId === freelancerId);
    }

    getProposalsByJobId(jobId) {
        const proposals = this.getProposals();
        return proposals.filter(proposal => proposal.jobId === jobId);
    }

    // Message methods
    getMessagesByUserId(userId) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        return conversations
            .filter(conv => conv.participants.includes(userId))
            .map(conv => {
                const otherParticipantId = conv.participants.find(id => id !== userId);
                const otherParticipant = users.find(user => user.id === otherParticipantId);
                const lastMessage = messages
                    .filter(msg => msg.conversationId === conv.id)
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

                return {
                    conversationId: conv.id,
                    senderName: otherParticipant.name,
                    senderAvatar: otherParticipant.avatar,
                    lastMessage: lastMessage.content,
                    timestamp: lastMessage.timestamp,
                    unreadCount: conv.unreadCount[userId] || 0
                };
            })
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    getConversationById(conversationId) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const conversation = conversations.find(conv => conv.id === conversationId);
        
        if (!conversation) return null;

        const participants = conversation.participants.map(id => 
            users.find(user => user.id === id)
        );

        return {
            ...conversation,
            participants: participants.map(p => ({
                id: p.id,
                name: p.name,
                avatar: p.avatar
            }))
        };
    }

    getConversationMessages(conversationId) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        return messages
            .filter(msg => msg.conversationId === conversationId)
            .map(msg => {
                const sender = users.find(user => user.id === msg.senderId);
                return {
                    ...msg,
                    senderName: sender.name,
                    senderAvatar: sender.avatar
                };
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    markConversationAsRead(conversationId, userId) {
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');

        // Mark all messages as read
        const updatedMessages = messages.map(msg => {
            if (msg.conversationId === conversationId && msg.senderId !== userId) {
                return { ...msg, read: true };
            }
            return msg;
        });

        // Reset unread count
        const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
                return {
                    ...conv,
                    unreadCount: {
                        ...conv.unreadCount,
                        [userId]: 0
                    }
                };
            }
            return conv;
        });

        localStorage.setItem('messages', JSON.stringify(updatedMessages));
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    }

    sendMessage({ conversationId, senderId, content, timestamp }) {
        const messages = JSON.parse(localStorage.getItem('messages') || '[]');
        const conversations = JSON.parse(localStorage.getItem('conversations') || '[]');

        // Create new message
        const newMessage = {
            id: Date.now().toString(),
            conversationId,
            senderId,
            content,
            timestamp,
            read: false
        };

        // Update conversation
        const updatedConversations = conversations.map(conv => {
            if (conv.id === conversationId) {
                const otherParticipantId = conv.participants.find(id => id !== senderId);
                return {
                    ...conv,
                    lastMessage: content,
                    lastMessageAt: timestamp,
                    unreadCount: {
                        ...conv.unreadCount,
                        [otherParticipantId]: (conv.unreadCount[otherParticipantId] || 0) + 1
                    }
                };
            }
            return conv;
        });

        // Save changes
        localStorage.setItem('messages', JSON.stringify([...messages, newMessage]));
        localStorage.setItem('conversations', JSON.stringify(updatedConversations));

        return newMessage;
    }

    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem(key) {
        const item = localStorage.getItem(key);
        try {
            return JSON.parse(item);
        } catch {
            return item;
        }
    }

    removeItem(key) {
        localStorage.removeItem(key);
    }
} 