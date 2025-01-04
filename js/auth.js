class AuthService {
    constructor(storageService) {
        this.storage = storageService;
    }

    login(user) {
        this.storage.setItem('authToken', user.token);
        this.storage.setItem('userSession', {
            userId: user.userId,
            email: user.email,
            expiresAt: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() // 30 days
        });
        this.storage.setItem('userData', user.userData);
        this.storage.setItem('currentUser', user.userId);
    }

    logout() {
        this.storage.removeItem('authToken');
        this.storage.removeItem('userSession');
        this.storage.removeItem('userData');
        this.storage.removeItem('currentUser');
    }

    isLoggedIn() {
        const authToken = this.storage.getItem('authToken');
        const userSession = this.storage.getItem('userSession');
        const currentUser = this.storage.getItem('currentUser');
        if (!authToken || !userSession || !currentUser) return false;

        try {
            const session = JSON.parse(userSession);
            if (new Date(session.expiresAt) < new Date()) {
                this.logout();
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error parsing user session:', error);
            this.logout();
            return false;
        }
    }

    getCurrentUser() {
        if (!this.isLoggedIn()) return null;
        const userData = this.storage.getItem('userData');
        try {
            return JSON.parse(userData);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
}

// Make it globally available
window.AuthService = AuthService; 