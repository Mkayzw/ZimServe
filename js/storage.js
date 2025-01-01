class StorageService {
    constructor() {
        this.initializeStorage();
    }

    initializeStorage() {
        // Initialize storage with empty arrays if not exists
        if (!localStorage.getItem('users')) {
            localStorage.setItem('users', JSON.stringify([]));
        }
        if (!localStorage.getItem('jobs')) {
            localStorage.setItem('jobs', JSON.stringify([]));
        }
        if (!localStorage.getItem('applications')) {
            localStorage.setItem('applications', JSON.stringify([]));
        }
        if (!localStorage.getItem('profiles')) {
            localStorage.setItem('profiles', JSON.stringify({}));
        }
        if (!localStorage.getItem('messages')) {
            localStorage.setItem('messages', JSON.stringify([]));
        }
    }

    // User Operations
    createUser(user) {
        const users = this.getUsers();
        user.id = Date.now();
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        return user;
    }

    getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    // Job Operations
    createJob(job) {
        const jobs = this.getJobs();
        job.id = job.id || Date.now();
        job.createdAt = job.createdAt || new Date().toISOString();
        jobs.push(job);
        localStorage.setItem('jobs', JSON.stringify(jobs));
        return job;
    }

    getJobs() {
        return JSON.parse(localStorage.getItem('jobs')) || [];
    }

    // Application Operations
    createApplication(application) {
        const applications = this.getApplications();
        application.id = Date.now();
        application.status = 'pending';
        application.appliedAt = new Date().toISOString();
        applications.push(application);
        localStorage.setItem('applications', JSON.stringify(applications));
        return application;
    }

    getApplications() {
        return JSON.parse(localStorage.getItem('applications')) || [];
    }

    updateApplicationStatus(applicationId, status) {
        const applications = this.getApplications();
        const application = applications.find(a => a.id === applicationId);
        
        if (!application) {
            throw new Error('Application not found');
        }

        // Verify the client owns the job
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const job = this.getJobs().find(j => j.id === application.jobId);
        
        if (!job || job.clientId !== currentUser.id) {
            throw new Error('Not authorized to update this application');
        }

        application.status = status;
        application.updatedAt = new Date().toISOString();
        localStorage.setItem('applications', JSON.stringify(applications));

        // If accepted, update job status and reject other applications
        if (status === 'accepted') {
            // Update job status
            const jobs = this.getJobs();
            const jobIndex = jobs.findIndex(j => j.id === application.jobId);
            if (jobIndex !== -1) {
                jobs[jobIndex].status = 'filled';
                localStorage.setItem('jobs', JSON.stringify(jobs));
            }

            // Reject other applications for this job
            const otherApplications = applications.filter(a => 
                a.jobId === application.jobId && 
                a.id !== applicationId &&
                a.status === 'pending'
            );
            otherApplications.forEach(a => {
                a.status = 'rejected';
                a.updatedAt = new Date().toISOString();
            });
            localStorage.setItem('applications', JSON.stringify(applications));
        }

        return application;
    }

    // Profile Operations
    getProfile(userId) {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        return profiles[userId] || null;
    }

    updateProfile(userId, profileData) {
        const profiles = JSON.parse(localStorage.getItem('profiles')) || {};
        profiles[userId] = {
            ...profiles[userId],
            ...profileData,
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('profiles', JSON.stringify(profiles));
        return profiles[userId];
    }

    // Message Operations
    createMessage(message) {
        const messages = this.getMessages();
        message.id = Date.now();
        message.timestamp = new Date().toISOString();
        message.read = false;
        messages.push(message);
        localStorage.setItem('messages', JSON.stringify(messages));
        return message;
    }

    getMessages() {
        return JSON.parse(localStorage.getItem('messages')) || [];
    }

    markMessageAsRead(messageId) {
        const messages = this.getMessages();
        const message = messages.find(m => m.id === messageId);
        if (message) {
            message.read = true;
            localStorage.setItem('messages', JSON.stringify(messages));
        }
    }
} 