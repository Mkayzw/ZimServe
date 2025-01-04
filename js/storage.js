// Storage Service
class StorageService {
    constructor() {
        // Initialize users array in localStorage if it doesn't exist
        if (!localStorage.getItem('users')) {
            // Add sample users
            const sampleUsers = [
                {
                    id: 1,
                    email: 'test@example.com',
                    password: 'password123',
                    name: 'Test User',
                    role: 'freelancer'
                },
                {
                    id: 2,
                    email: 'client@example.com',
                    password: 'password123',
                    name: 'Client User',
                    role: 'client'
                }
            ];
            localStorage.setItem('users', JSON.stringify(sampleUsers));
        }
    }

    register(email, password, role) {
        const users = JSON.parse(localStorage.getItem('users'));
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
        }

        // Create new user
        const user = {
            id: Date.now(),
            email: email,
            password: password, // In real app, this should be hashed
            role: role,
            name: email.split('@')[0]
        };

        // Add to users array
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, user };
    }

    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, error: 'Invalid email or password' };
        }

        // Store current user
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
    }

    logout() {
        localStorage.removeItem('currentUser');
    }

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    }

    setItem(key, value) {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
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

    // Example method to get user by ID
    getUserById(userId) {
        const users = this.getItem('users') || [];
        return users.find(user => user.id === userId) || null;
    }

    // Placeholder methods for proposals and jobs
    getProposalsByFreelancerId(userId) {
        const proposals = this.getItem('proposals') || [];
        return proposals.filter(p => p.freelancerId === userId);
    }

    getJobs() {
        return this.getItem('jobs') || [];
    }

    // Add other necessary methods...
}

// Make it globally available
window.StorageService = StorageService; 