class DashboardService {
    constructor(storageService, authService) {
        this.storageService = storageService;
        this.authService = authService;
    }

    getDashboardData(userId) {
        const user = this.storageService.getUserById(userId);
        if (!user) return null;

        return {
            user,
            activeProposals: this.getActiveProposals(userId),
            activeJobs: this.getActiveJobs(userId),
            recentActivity: this.getRecentActivity(userId),
            recommendedJobs: this.getRecommendedJobs(userId)
        };
    }

    getActiveProposals(userId) {
        const proposals = this.storageService.getProposalsByFreelancerId(userId);
        return proposals.filter(proposal => proposal.status === 'pending');
    }

    getActiveJobs(userId) {
        const jobs = this.storageService.getJobs();
        return jobs.filter(job => job.postedBy === userId && job.status === 'open');
    }

    getRecentActivity(userId) {
        const proposals = this.storageService.getProposalsByFreelancerId(userId);
        return proposals
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);
    }

    getRecommendedJobs(userId) {
        const user = this.storageService.getUserById(userId);
        const jobs = this.storageService.getJobs();
        
        // Filter jobs that match user's skills
        return jobs
            .filter(job => {
                if (job.postedBy === userId) return false; // Don't recommend own jobs
                if (job.status !== 'open') return false;
                
                // For freelancers, match skills
                if (user.role === 'freelancer') {
                    return job.skills.some(skill => user.skills.includes(skill));
                }
                
                return true;
            })
            .slice(0, 5);
    }

    formatCurrency(amount) {
        return `$${amount.toFixed(2)}`;
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const then = new Date(timestamp);
        const diffInSeconds = Math.floor((now - then) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
}

class Dashboard {
    constructor(storageService, authService) {
        this.storage = storageService;
        this.auth = authService;
        this.dashboardService = new DashboardService(storageService, authService);
    }

    initialize() {
        const currentUser = this.auth.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'auth/login.html';
            return;
        }

        // Update welcome message
        document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.name}!`;

        // Get dashboard data
        const dashboardData = this.dashboardService.getDashboardData(currentUser.id);
        if (!dashboardData) return;

        // Update stats
        if (currentUser.role === 'freelancer') {
            document.getElementById('totalEarnings').textContent = this.dashboardService.formatCurrency(currentUser.totalEarnings || 0);
            document.getElementById('activeProposals').textContent = dashboardData.activeProposals.length;
        } else {
            document.getElementById('totalEarnings').textContent = this.dashboardService.formatCurrency(currentUser.totalSpent || 0);
            document.getElementById('activeProposals').textContent = dashboardData.activeJobs.length;
        }

        // Update recent proposals list
        const recentProposalsList = document.getElementById('recentProposalsList');
        if (dashboardData.recentActivity.length > 0) {
            recentProposalsList.innerHTML = dashboardData.recentActivity.map(proposal => {
                const job = this.storage.getJobById(proposal.jobId);
                return `
                    <div class="flex items-center justify-between p-4">
                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">${job.title}</p>
                            <p class="text-sm text-muted-foreground">
                                ${this.dashboardService.formatCurrency(proposal.proposedAmount)} • ${proposal.estimatedDuration}
                            </p>
                        </div>
                        <p class="text-sm text-muted-foreground">${this.dashboardService.formatTimeAgo(proposal.submittedAt)}</p>
                    </div>
                `;
            }).join('');
        } else {
            recentProposalsList.innerHTML = '<p>No recent activity.</p>';
        }

        // Update recommended jobs list
        const recommendedJobsList = document.getElementById('recommendedJobsList');
        if (dashboardData.recommendedJobs.length > 0) {
            recommendedJobsList.innerHTML = dashboardData.recommendedJobs.map(job => {
                const employer = this.storage.getUserById(job.postedBy);
                return `
                    <div class="flex items-center justify-between p-4">
                        <div class="grid gap-1">
                            <p class="text-sm font-medium leading-none">${job.title}</p>
                            <p class="text-sm text-muted-foreground">
                                ${employer.company || employer.name} • ${this.dashboardService.formatCurrency(job.budget)}
                            </p>
                        </div>
                        <a href="apply.html?jobId=${job.id}" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                            Apply
                        </a>
                    </div>
                `;
            }).join('');
        } else {
            recommendedJobsList.innerHTML = '<p>No recommended jobs available.</p>';
        }
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    const storageService = new StorageService();
    const authService = new AuthService(storageService);
    const dashboard = new Dashboard(storageService, authService);
    dashboard.initialize();

    // Expose dashboard for global access if needed
    window.dashboard = dashboard;
}); 