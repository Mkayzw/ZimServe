class DashboardService {
    constructor(storageService) {
        this.storageService = storageService;
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
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) return interval + ' years ago';
        if (interval === 1) return '1 year ago';
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) return interval + ' months ago';
        if (interval === 1) return '1 month ago';
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) return interval + ' days ago';
        if (interval === 1) return '1 day ago';
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + ' hours ago';
        if (interval === 1) return '1 hour ago';
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + ' minutes ago';
        if (interval === 1) return '1 minute ago';
        
        if (seconds < 10) return 'just now';
        
        return Math.floor(seconds) + ' seconds ago';
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    const storageService = new StorageService();
    const dashboardService = new DashboardService(storageService);
    const currentUser = storageService.getCurrentUser();

    if (!currentUser) {
        window.location.href = 'auth/login.html';
        return;
    }

    // Update welcome message
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${currentUser.name}!`;

    // Get dashboard data
    const dashboardData = dashboardService.getDashboardData(currentUser.id);
    if (!dashboardData) return;

    // Update stats
    if (currentUser.role === 'freelancer') {
        document.getElementById('totalEarnings').textContent = dashboardService.formatCurrency(currentUser.totalEarnings || 0);
        document.getElementById('activeProposals').textContent = dashboardData.activeProposals.length;
    } else {
        document.getElementById('totalEarnings').textContent = dashboardService.formatCurrency(currentUser.totalSpent || 0);
        document.getElementById('activeProposals').textContent = dashboardData.activeJobs.length;
    }

    // Update recent proposals list
    const recentProposalsList = document.getElementById('recentProposalsList');
    if (dashboardData.recentActivity.length > 0) {
        recentProposalsList.innerHTML = dashboardData.recentActivity.map(proposal => {
            const job = storageService.getJobById(proposal.jobId);
            return `
                <div class="flex items-center justify-between p-4">
                    <div class="grid gap-1">
                        <p class="text-sm font-medium leading-none">${job.title}</p>
                        <p class="text-sm text-muted-foreground">
                            ${dashboardService.formatCurrency(proposal.proposedAmount)} • ${proposal.estimatedDuration}
                        </p>
                    </div>
                    <p class="text-sm text-muted-foreground">${dashboardService.formatTimeAgo(proposal.submittedAt)}</p>
                </div>
            `;
        }).join('');
    }

    // Update recommended jobs list
    const recommendedJobsList = document.getElementById('recommendedJobsList');
    if (dashboardData.recommendedJobs.length > 0) {
        recommendedJobsList.innerHTML = dashboardData.recommendedJobs.map(job => {
            const employer = storageService.getUserById(job.postedBy);
            return `
                <div class="flex items-center justify-between p-4">
                    <div class="grid gap-1">
                        <p class="text-sm font-medium leading-none">${job.title}</p>
                        <p class="text-sm text-muted-foreground">
                            ${employer.company || employer.name} • ${dashboardService.formatCurrency(job.budget)}
                        </p>
                    </div>
                    <a href="apply.html?jobId=${job.id}" class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3">
                        Apply
                    </a>
                </div>
            `;
        }).join('');
    }
}); 