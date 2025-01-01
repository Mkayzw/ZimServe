class SearchService {
    constructor(storageService) {
        this.storage = storageService;
    }

    searchJobs(filters) {
        let jobs = this.storage.getJobs();

        if (filters.query) {
            const query = filters.query.toLowerCase();
            jobs = jobs.filter(job => 
                job.title.toLowerCase().includes(query) ||
                job.description.toLowerCase().includes(query)
            );
        }

        if (filters.minBudget) {
            jobs = jobs.filter(job => job.budget >= filters.minBudget);
        }

        if (filters.maxBudget) {
            jobs = jobs.filter(job => job.budget <= filters.maxBudget);
        }

        if (filters.category) {
            jobs = jobs.filter(job => job.category === filters.category);
        }

        if (filters.status) {
            jobs = jobs.filter(job => job.status === filters.status);
        }

        return jobs;
    }
} 