class Dashboard {
    constructor(storageService, authService) {
        this.storage = storageService;
        this.auth = authService;
        this.currentUser = null;
    }

    initialize() {
        this.currentUser = this.auth.getCurrentUser();
        if (!this.currentUser) return;

        this.updateNavigation();
        this.renderDashboard();
    }

    updateNavigation() {
        const navLinks = document.getElementById('navLinks');
        navLinks.innerHTML = `
            <button onclick="handleLogout()">Logout</button>
            <span>Welcome, ${this.currentUser.name}</span>
        `;
    }

    renderDashboard() {
        const dashboard = document.getElementById('dashboard');
        document.getElementById('authForms').classList.add('hidden');
        dashboard.classList.remove('hidden');

        if (this.currentUser.role === 'client') {
            this.renderClientDashboard();
        } else {
            this.renderFreelancerDashboard();
        }
    }

    renderClientDashboard() {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <h2>Client Dashboard</h2>
            <div class="dashboard-actions">
                <button onclick="showJobPostForm()">Post New Job</button>
            </div>
            <div id="jobPostForm" class="hidden">
                <form onsubmit="handleJobPost(event)">
                    <input type="text" name="title" placeholder="Job Title" required>
                    <textarea name="description" placeholder="Job Description" required></textarea>
                    <input type="number" name="budget" placeholder="Budget" required>
                    <button type="submit">Post Job</button>
                </form>
            </div>
            <div id="myPostedJobs">
                <!-- Posted jobs will be listed here -->
            </div>
        `;
        this.loadPostedJobs();
    }

    renderFreelancerDashboard() {
        const dashboard = document.getElementById('dashboard');
        dashboard.innerHTML = `
            <h2>Freelancer Dashboard</h2>
            <div id="availableJobs">
                <!-- Available jobs will be listed here -->
            </div>
            <div id="myApplications">
                <!-- Applied jobs will be listed here -->
            </div>
        `;
        this.loadAvailableJobs();
        this.loadMyApplications();
    }

    loadPostedJobs() {
        const jobs = this.storage.getJobs()
            .filter(job => job.clientId === this.currentUser.id);
        const jobsContainer = document.getElementById('myPostedJobs');
        
        jobsContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p>Budget: $${job.budget}</p>
                <button onclick="viewApplications(${job.id})">View Applications</button>
            </div>
        `).join('');
    }

    loadAvailableJobs() {
        const jobs = this.storage.getJobs();
        const jobsContainer = document.getElementById('availableJobs');
        
        jobsContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p>Budget: $${job.budget}</p>
                <button onclick="applyForJob(${job.id})">Apply</button>
            </div>
        `).join('');
    }

    loadMyApplications() {
        const applications = this.storage.getApplications()
            .filter(app => app.freelancerId === this.currentUser.id);
        const applicationsContainer = document.getElementById('myApplications');
        
        applicationsContainer.innerHTML = applications.map(app => `
            <div class="application-card">
                <h3>${app.jobTitle}</h3>
                <p>Status: ${app.status}</p>
                <p>Applied: ${new Date(app.appliedAt).toLocaleDateString()}</p>
            </div>
        `).join('');
    }
}

// Global instance
const dashboard = new Dashboard(new StorageService(), new AuthService(new StorageService()));

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    dashboard.initialize();
}); 