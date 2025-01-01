class AuthService {
    constructor(storageService) {
        this.storage = storageService;
    }

    register(userData) {
        const users = this.storage.getUsers();
        
        // Check if user already exists
        if (users.find(user => user.email === userData.email)) {
            throw new Error('User already exists');
        }

        const user = this.storage.createUser({
            ...userData,
            password: this.hashPassword(userData.password) // In real app, use proper hashing
        });

        return this.setCurrentUser(user);
    }

    login(email, password) {
        const users = this.storage.getUsers();
        const user = users.find(u => 
            u.email === email && 
            u.password === this.hashPassword(password)
        );

        if (!user) {
            throw new Error('Invalid credentials');
        }

        return this.setCurrentUser(user);
    }

    setCurrentUser(user) {
        const { password, ...userWithoutPassword } = user;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        return userWithoutPassword;
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    logout() {
        localStorage.removeItem('currentUser');
    }

    // Simple hash function (NOT for production use)
    hashPassword(password) {
        return btoa(password);
    }
} 