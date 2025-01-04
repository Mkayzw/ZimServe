// Community page functionality
class CommunityPage {
    constructor() {
        this.initializeEventListeners();
        this.loadDiscussions();
        this.loadEvents();
    }

    initializeEventListeners() {
        // Start New Discussion button
        const newDiscussionBtn = document.querySelector('button.btn-primary');
        if (newDiscussionBtn) {
            newDiscussionBtn.addEventListener('click', () => this.handleNewDiscussion());
        }

        // Event registration buttons
        const registerButtons = document.querySelectorAll('button.btn-secondary');
        registerButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleEventRegistration(e));
        });

        // Discussion topic clicks
        const discussionTopics = document.querySelectorAll('.rounded-lg.border.bg-card');
        discussionTopics.forEach(topic => {
            topic.addEventListener('click', (e) => this.handleTopicClick(e));
        });
    }

    async loadDiscussions() {
        try {
            // In a real app, this would fetch from an API
            const discussions = await this.fetchDiscussions();
            this.updateDiscussionUI(discussions);
        } catch (error) {
            console.error('Error loading discussions:', error);
            // Show error message to user
            this.showNotification('Error loading discussions. Please try again later.', 'error');
        }
    }

    async loadEvents() {
        try {
            // In a real app, this would fetch from an API
            const events = await this.fetchEvents();
            this.updateEventsUI(events);
        } catch (error) {
            console.error('Error loading events:', error);
            // Show error message to user
            this.showNotification('Error loading events. Please try again later.', 'error');
        }
    }

    async handleNewDiscussion() {
        // Check if user is logged in
        if (!this.isUserLoggedIn()) {
            this.showLoginPrompt();
            return;
        }

        // Show discussion creation modal
        this.showDiscussionModal();
    }

    async handleEventRegistration(event) {
        const eventCard = event.target.closest('.rounded-lg');
        const eventTitle = eventCard.querySelector('h3').textContent;
        const eventDate = eventCard.querySelector('.text-sm.text-primary').textContent;

        // Check if user is logged in
        if (!this.isUserLoggedIn()) {
            this.showLoginPrompt();
            return;
        }

        try {
            // In a real app, this would call an API
            await this.registerForEvent({
                title: eventTitle,
                date: eventDate
            });

            // Show success message
            this.showNotification('Successfully registered for event!', 'success');
            
            // Update button state
            event.target.textContent = 'Registered';
            event.target.disabled = true;
        } catch (error) {
            console.error('Error registering for event:', error);
            this.showNotification('Error registering for event. Please try again.', 'error');
        }
    }

    handleTopicClick(event) {
        const topicTitle = event.currentTarget.querySelector('h3').textContent;
        // Navigate to topic detail page
        window.location.href = `/community/topic/${this.slugify(topicTitle)}`;
    }

    // Helper methods
    isUserLoggedIn() {
        // Check for persistent login state
        const authToken = localStorage.getItem('authToken');
        const userSession = localStorage.getItem('userSession');
        
        if (!authToken || !userSession) {
            return false;
        }

        try {
            // Parse the session data
            const session = JSON.parse(userSession);
            
            // Check if session has expired
            if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
                // Clear expired session
                this.logout();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error checking login state:', error);
            return false;
        }
    }

    logout() {
        // Clear all auth-related data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userSession');
        localStorage.removeItem('userData');
        
        // Redirect to login page
        window.location.href = '/auth/login.html';
    }

    showLoginPrompt() {
        // Redirect to login page with return URL
        const returnUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `/auth/login.html?returnUrl=${returnUrl}`;
    }

    showDiscussionModal() {
        const modalHtml = `
            <div class="modal-overlay" id="newDiscussionModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">Start New Discussion</h3>
                        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="newDiscussionForm">
                            <div class="form-group">
                                <label class="form-label" for="discussionTitle">Title</label>
                                <input type="text" id="discussionTitle" class="form-input" placeholder="Enter discussion title" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="discussionCategory">Category</label>
                                <select id="discussionCategory" class="form-input" required>
                                    <option value="">Select a category</option>
                                    <option value="tech">Technology</option>
                                    <option value="business">Business</option>
                                    <option value="design">Design</option>
                                    <option value="writing">Writing</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="discussionContent">Content</label>
                                <textarea id="discussionContent" class="form-textarea" placeholder="Write your discussion content here..." required></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label" for="discussionTags">Tags</label>
                                <input type="text" id="discussionTags" class="form-input" placeholder="Enter tags separated by commas">
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                        <button class="btn-primary" onclick="communityPage.submitDiscussion()">Create Discussion</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Add event listener for form submission
        const modal = document.getElementById('newDiscussionModal');
        modal.querySelector('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDiscussion();
        });
    }

    async submitDiscussion() {
        const form = document.getElementById('newDiscussionForm');
        const title = form.querySelector('#discussionTitle').value;
        const category = form.querySelector('#discussionCategory').value;
        const content = form.querySelector('#discussionContent').value;
        const tags = form.querySelector('#discussionTags').value.split(',').map(tag => tag.trim());

        if (!title || !category || !content) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        try {
            // Show loading state
            const submitButton = document.querySelector('.modal-footer .btn-primary');
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            // In a real app, this would be an API call
            await this.createDiscussion({
                title,
                category,
                content,
                tags
            });

            // Close modal
            document.getElementById('newDiscussionModal').remove();

            // Show success message
            this.showNotification('Discussion created successfully!', 'success');

            // Reload discussions
            this.loadDiscussions();
        } catch (error) {
            console.error('Error creating discussion:', error);
            this.showNotification('Error creating discussion. Please try again.', 'error');
        }
    }

    async createDiscussion(discussionData) {
        return new Promise((resolve) => {
            // Simulate API call
            setTimeout(() => {
                console.log('Creating discussion:', discussionData);
                resolve({ success: true });
            }, 1000);
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after delay
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    slugify(text) {
        return text.toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    }

    // Mock API calls - in a real app these would call actual endpoints
    async fetchDiscussions() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        title: 'Getting Started in Tech',
                        description: 'Resources and guidance for aspiring Zimbabwean tech freelancers',
                        topics: 156,
                        posts: 1200,
                        latestPost: {
                            title: 'From Zero to Full Stack: My Journey as a Self-taught Developer',
                            author: 'John D.',
                            timeAgo: '2h'
                        }
                    }
                    // Add more mock discussions
                ]);
            }, 500);
        });
    }

    async fetchEvents() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    {
                        title: 'HustleHub Networking Night',
                        date: 'Mar 15, 2024',
                        location: 'Harare CBD',
                        description: 'Connect with local freelancers and businesses over drinks and snacks.',
                        price: 'Free'
                    }
                    // Add more mock events
                ]);
            }, 500);
        });
    }

    async registerForEvent(eventData) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate API call success
                resolve({ success: true });
            }, 1000);
        });
    }

    updateDiscussionUI(discussions) {
        // Update UI with fetched discussions
        // This would update the discussion cards with real data
        console.log('Updating discussions:', discussions);
    }

    updateEventsUI(events) {
        // Update UI with fetched events
        // This would update the event cards with real data
        console.log('Updating events:', events);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CommunityPage();
}); 