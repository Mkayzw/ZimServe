// Authentication Service
class AuthService {
    constructor() {
        this.tokenKey = 'authToken';
        this.userKey = 'userData';
        this.sessionKey = 'userSession';
        this.returnUrlKey = 'returnUrl';
    }

    // Login user
    async login(email, password) {
        try {
            // In production, this would be an API call
            const response = await this.mockLoginAPI(email, password);
            
            if (response.success) {
                this.setSession(response);
                
                // Handle return URL
                const returnUrl = this.getReturnUrl();
                if (returnUrl) {
                    window.location.href = returnUrl;
                } else {
                    window.location.href = '/dashboard.html';
                }
                
                return { success: true, user: response.userData };
            }
            
            return { success: false, error: 'Invalid credentials' };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Authentication failed' };
        }
    }

    // OAuth login (Google)
    async loginWithGoogle() {
        try {
            // In production, this would integrate with Google OAuth
            const response = await this.mockGoogleLogin();
            
            if (response.success) {
                this.setSession(response);
                
                // Handle return URL
                const returnUrl = this.getReturnUrl();
                if (returnUrl) {
                    window.location.href = returnUrl;
                } else {
                    window.location.href = '/dashboard.html';
                }
                
                return { success: true, user: response.userData };
            }
            
            return { success: false, error: 'Google authentication failed' };
        } catch (error) {
            console.error('Google login error:', error);
            return { success: false, error: 'Authentication failed' };
        }
    }

    // Save return URL
    saveReturnUrl(url) {
        if (url && !this.isAuthPage(url)) {
            sessionStorage.setItem(this.returnUrlKey, url);
        }
    }

    // Get and clear return URL
    getReturnUrl() {
        const returnUrl = sessionStorage.getItem(this.returnUrlKey);
        sessionStorage.removeItem(this.returnUrlKey);
        return returnUrl && !this.isAuthPage(returnUrl) ? returnUrl : null;
    }

    // Check if URL is an auth page
    isAuthPage(url) {
        const authPages = ['/auth/login.html', '/auth/signup.html', '/auth/forgot-password.html'];
        return authPages.some(page => url.includes(page));
    }

    // Redirect to login with return URL
    redirectToLogin(returnUrl = window.location.pathname) {
        this.saveReturnUrl(returnUrl);
        window.location.href = '/auth/login.html';
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        localStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.returnUrlKey);
        window.location.href = '/auth/login.html';
    }

    // Check if user is logged in
    isLoggedIn() {
        const token = localStorage.getItem(this.tokenKey);
        const session = localStorage.getItem(this.sessionKey);
        
        if (!token || !session) {
            return false;
        }

        try {
            const sessionData = JSON.parse(session);
            if (new Date(sessionData.expiresAt) < new Date()) {
                this.logout();
                return false;
            }
            return true;
        } catch {
            return false;
        }
    }

    // Get current user
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.userKey);
            return userData ? JSON.parse(userData) : null;
        } catch {
            return null;
        }
    }

    // Check if user has required role
    hasRole(requiredRole) {
        const user = this.getCurrentUser();
        return user && user.role === requiredRole;
    }

    // Check if user has required permission
    hasPermission(requiredPermission) {
        const user = this.getCurrentUser();
        return user && user.permissions && user.permissions.includes(requiredPermission);
    }

    // Set session data
    setSession(response) {
        const { token, userData, expiresIn = 86400 } = response; // Default to 24 hours
        
        const session = {
            userId: userData.id,
            expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
        };

        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(userData));
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }

    // Mock API calls (replace with real API calls in production)
    async mockLoginAPI(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock-jwt-token',
                    userData: {
                        id: '123',
                        name: 'John Doe',
                        email: email,
                        role: 'freelancer',
                        permissions: ['read:jobs', 'create:proposals', 'read:messages']
                    },
                    expiresIn: 86400 // 24 hours
                });
            }, 1000);
        });
    }

    async mockGoogleLogin() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock-google-token',
                    userData: {
                        id: '456',
                        name: 'Google User',
                        email: 'user@gmail.com',
                        role: 'client',
                        permissions: ['post:jobs', 'read:proposals', 'read:messages']
                    },
                    expiresIn: 86400 // 24 hours
                });
            }, 1000);
        });
    }
}

// Initialize auth service
const authService = new AuthService(); 