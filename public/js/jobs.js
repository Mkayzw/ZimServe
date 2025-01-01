class JobService {
    constructor(storageService) {
        this.storage = storageService;
    }

    createJob(jobData) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'client') {
            throw new Error('Only clients can post jobs');
        }

        const job = {
            ...jobData,
            clientId: currentUser.id,
            clientName: currentUser.name,
            status: 'open',
            createdAt: new Date().toISOString()
        };

        return this.storage.createJob(job);
    }

    applyForJob(jobId, coverLetter) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'freelancer') {
            throw new Error('Only freelancers can apply for jobs');
        }

        const job = this.storage.getJobs().find(j => j.id === jobId);
        if (!job) {
            throw new Error('Job not found');
        }

        const application = {
            jobId,
            jobTitle: job.title,
            freelancerId: currentUser.id,
            freelancerName: currentUser.name,
            coverLetter,
            status: 'pending'
        };

        return this.storage.createApplication(application);
    }

    updateApplicationStatus(applicationId, status) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'client') {
            throw new Error('Only clients can update application status');
        }

        return this.storage.updateApplicationStatus(applicationId, status);
    }
}

class Dashboard {
    constructor(storageService, authService) {
        this.storage = storageService;
        this.auth = authService;
        this.jobService = new JobService(storageService);
    }

    loadPostedJobs() {
        const currentUser = this.auth.getCurrentUser();
        const jobs = this.storage.getJobs()
            .filter(job => job.clientId === currentUser.id);
        const jobsContainer = document.getElementById('myPostedJobs');
        
        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<p>You haven\'t posted any jobs yet.</p>';
            return;
        }

        jobsContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p class="budget">Budget: $${job.budget}</p>
                <p>Status: ${job.status}</p>
                <p>Posted: ${new Date(job.createdAt).toLocaleDateString()}</p>
                <button onclick="showApplicationsModal(${job.id})" class="btn-secondary">
                    View Applications (${this.getApplicationCount(job.id)})
                </button>
            </div>
        `).join('');
    }

    loadAvailableJobs() {
        const currentUser = this.auth.getCurrentUser();
        const jobs = this.storage.getJobs()
            .filter(job => job.status === 'open' && job.clientId !== currentUser.id);
        const jobsContainer = document.getElementById('availableJobs');
        
        if (jobs.length === 0) {
            jobsContainer.innerHTML = '<p>No jobs available at the moment.</p>';
            return;
        }

        jobsContainer.innerHTML = jobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p>${job.description}</p>
                <p class="budget">Budget: $${job.budget}</p>
                <p>Posted by: ${job.clientName}</p>
                <p>Posted: ${new Date(job.createdAt).toLocaleDateString()}</p>
                <div class="job-actions">
                    ${this.hasApplied(job.id) 
                        ? '<button disabled class="btn-secondary">Applied</button>'
                        : `<a href="/public/apply.html?jobId=${job.id}" class="btn-primary">Apply Now</a>`
                    }
                </div>
            </div>
        `).join('');
    }

    loadMyApplications() {
        const currentUser = this.auth.getCurrentUser();
        const applications = this.storage.getApplications()
            .filter(app => app.freelancerId === currentUser.id);
        const applicationsContainer = document.getElementById('myApplications');
        
        if (applications.length === 0) {
            applicationsContainer.innerHTML = '<p>You haven\'t applied to any jobs yet.</p>';
            return;
        }

        applicationsContainer.innerHTML = applications.map(app => `
            <div class="job-card">
                <h3>${app.jobTitle}</h3>
                <div class="status status-${app.status.toLowerCase()}">${app.status}</div>
                <p>Applied: ${new Date(app.appliedAt).toLocaleDateString()}</p>
                ${app.coverLetter ? `<p>Cover Letter: ${app.coverLetter}</p>` : ''}
            </div>
        `).join('');
    }

    loadJobApplications(jobId) {
        const job = this.storage.getJobs().find(j => j.id === jobId);
        if (!job) return;

        document.getElementById('jobTitle').textContent = job.title;
        
        const applications = this.storage.getApplications()
            .filter(app => app.jobId === jobId);
        const container = document.getElementById('applicationsContainer');

        if (applications.length === 0) {
            container.innerHTML = '<p>No applications yet.</p>';
            return;
        }

        container.innerHTML = applications.map(app => `
            <div class="application-item">
                <div class="applicant-name">${app.freelancerName}</div>
                <div class="status status-${app.status.toLowerCase()}">${app.status}</div>
                ${app.coverLetter ? `<p>${app.coverLetter}</p>` : ''}
                <div class="application-actions">
                    ${app.status === 'pending' ? `
                        <button onclick="updateApplicationStatus(${app.id}, 'accepted')" class="btn-primary">Accept</button>
                        <button onclick="updateApplicationStatus(${app.id}, 'rejected')" class="btn-secondary">Reject</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getApplicationCount(jobId) {
        return this.storage.getApplications()
            .filter(app => app.jobId === jobId)
            .length;
    }

    hasApplied(jobId) {
        const currentUser = this.auth.getCurrentUser();
        return this.storage.getApplications()
            .some(app => app.jobId === jobId && app.freelancerId === currentUser.id);
    }
}

// Global handlers
function handleJobPost(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const jobService = new JobService(new StorageService());

    try {
        jobService.createJob({
            title: formData.get('title'),
            description: formData.get('description'),
            budget: Number(formData.get('budget'))
        });
        
        event.target.reset();
        document.getElementById('jobPostForm').classList.add('hidden');
        dashboard.loadPostedJobs();
        alert('Job posted successfully!');
    } catch (error) {
        alert(error.message);
    }
}

function updateApplicationStatus(applicationId, status) {
    const jobService = new JobService(new StorageService());
    
    try {
        jobService.updateApplicationStatus(applicationId, status);
        alert(`Application ${status} successfully!`);
        const modal = document.getElementById('applicationsModal');
        modal.style.display = 'none';
        dashboard.loadPostedJobs();
    } catch (error) {
        alert(error.message);
    }
} 