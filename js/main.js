// Main JavaScript file for HustleHub Zimbabwe

// Handle mobile navigation
document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('.menu-button');
    const navMenu = document.querySelector('#nav-menu');

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', () => {
            const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (!navMenu.contains(event.target) && !menuButton.contains(event.target)) {
                menuButton.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                menuButton.setAttribute('aria-expanded', 'false');
                navMenu.classList.remove('active');
            }
        });
    }
});

// Handle loading states for buttons
document.addEventListener('click', (event) => {
    const button = event.target.closest('.btn-primary, .btn-secondary');
    if (button && !button.classList.contains('btn-loading')) {
        // Only add loading state if the button triggers navigation or form submission
        if (button.tagName === 'BUTTON' || 
            (button.tagName === 'A' && button.href && !button.href.startsWith('#'))) {
            button.classList.add('btn-loading');
        }
    }
});

// Load featured jobs
async function loadFeaturedJobs() {
    const jobsGrid = document.querySelector('.jobs-grid');
    if (!jobsGrid) return;

    try {
        // Show skeleton loader
        const skeletonLoader = jobsGrid.querySelector('.skeleton-loader');
        if (skeletonLoader) {
            skeletonLoader.style.display = 'block';
        }

        // Simulate API call (replace with actual API endpoint)
        const response = await fetch('/api/featured-jobs');
        const jobs = await response.json();

        // Hide skeleton loader
        if (skeletonLoader) {
            skeletonLoader.style.display = 'none';
        }

        // Render jobs
        jobs.forEach(job => {
            const jobCard = createJobCard(job);
            jobsGrid.appendChild(jobCard);
        });
    } catch (error) {
        console.error('Error loading featured jobs:', error);
        // Show error message to user
        jobsGrid.innerHTML = `
            <div class="error-message" role="alert">
                <p>Failed to load featured jobs. Please try again later.</p>
                <button onclick="loadFeaturedJobs()" class="btn-secondary">Retry</button>
            </div>
        `;
    }
}

// Create job card element
function createJobCard(job) {
    const card = document.createElement('article');
    card.className = 'job-card';
    card.setAttribute('role', 'listitem');
    
    card.innerHTML = `
        <h3>
            <a href="/jobs/${job.id}" class="job-title">
                ${escapeHtml(job.title)}
            </a>
        </h3>
        <p class="job-description">${escapeHtml(job.description)}</p>
        <p class="budget">${formatCurrency(job.budget)}</p>
        <div class="job-meta">
            <span class="job-type" aria-label="Job Type">${escapeHtml(job.type)}</span>
            <span class="job-location" aria-label="Location">${escapeHtml(job.location)}</span>
        </div>
        <div class="job-actions">
            <a href="/jobs/${job.id}/apply" class="btn-primary">
                Apply Now
                <span class="sr-only">for ${escapeHtml(job.title)}</span>
            </a>
            <button class="btn-secondary" aria-label="Save job" onclick="saveJob(${job.id})">
                <svg width="20" height="20" aria-hidden="true" focusable="false">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
            </button>
        </div>
    `;
    
    return card;
}

// Utility functions
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Save job to favorites
async function saveJob(jobId) {
    try {
        // Simulate API call (replace with actual API endpoint)
        const response = await fetch('/api/save-job', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobId })
        });

        if (!response.ok) {
            throw new Error('Failed to save job');
        }

        // Show success message
        showNotification('Job saved to favorites!', 'success');
    } catch (error) {
        console.error('Error saving job:', error);
        showNotification('Failed to save job. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.innerHTML = message;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize featured jobs on page load
if (document.querySelector('.featured-jobs')) {
    loadFeaturedJobs();
} 