// Protected Routes Service
class ProtectedRoutes {
    constructor() {
        this.publicRoutes = [
            '/index.html',
            '/auth/login.html',
            '/auth/signup.html',
            '/help-center.html',
            '/blog.html'
        ];

        this.roleRoutes = {
            'freelancer': ['/dashboard.html', '/proposals.html', '/jobs.html'],
            'client': ['/dashboard.html', '/post-job.html', '/manage-jobs.html'],
            'admin': ['/admin/dashboard.html', '/admin/users.html', '/admin/jobs.html']
        };

        this.init();
    }

    init() {
        // Check if current route needs protection
        if (!this.isPublicRoute(window.location.pathname)) {
            this.protectRoute();
        }

        // Handle return URL if on login page
        if (this.isLoginPage()) {
            this.handleLoginPageLoad();
        }
    }

    isPublicRoute(path) {
        return this.publicRoutes.some(route => path.endsWith(route));
    }

    isLoginPage() {
        return window.location.pathname.endsWith('/auth/login.html');
    }

    handleLoginPageLoad() {
        // Get return URL from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        const returnUrl = urlParams.get('returnUrl');
        
        if (returnUrl) {
            authService.saveReturnUrl(returnUrl);
        }

        // If user is already logged in, redirect to appropriate page
        if (authService.isLoggedIn()) {
            const savedReturnUrl = authService.getReturnUrl();
            window.location.href = savedReturnUrl || '/dashboard.html';
        }
    }

    protectRoute() {
        // Check if user is logged in
        if (!authService.isLoggedIn()) {
            authService.redirectToLogin(window.location.pathname);
            return;
        }

        // Get current user and check role permissions
        const user = authService.getCurrentUser();
        if (!user || !user.role) {
            authService.redirectToLogin(window.location.pathname);
            return;
        }

        // Check if user has access to this route
        const userRoleRoutes = this.roleRoutes[user.role] || [];
        if (!userRoleRoutes.some(route => window.location.pathname.endsWith(route))) {
            this.redirectToDashboard();
        }
    }

    redirectToDashboard() {
        window.location.href = '/dashboard.html';
    }
}

// Initialize protection on page load
document.addEventListener('DOMContentLoaded', () => {
    const storageService = new StorageService();
    const authService = new AuthService(storageService);

    if (!authService.isLoggedIn()) {
        const currentUrl = window.location.href;
        const loginUrl = `auth/login.html?returnUrl=${encodeURIComponent(currentUrl)}`;
        window.location.href = loginUrl;
    }
}); 