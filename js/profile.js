class ProfileManager {
    constructor(storageService, authService) {
        this.storage = storageService;
        this.auth = authService;
        this.currentUser = null;
        this.setupEventListeners();
    }

    initialize() {
        this.currentUser = this.auth.getCurrentUser();
        if (!this.currentUser) {
            window.location.href = '/public/auth/login.html';
            return;
        }

        this.loadProfile();
    }

    setupEventListeners() {
        // Profile picture upload
        document.getElementById('pictureUpload').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const imageData = e.target.result;
                    document.getElementById('profilePicture').src = imageData;
                    this.saveProfileData({ profilePicture: imageData });
                };
                reader.readAsDataURL(file);
            }
        });

        // Skills input
        document.getElementById('skillInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const skill = e.target.value.trim();
                if (skill) {
                    this.addSkill(skill);
                    e.target.value = '';
                }
            }
        });

        // About section editing
        document.getElementById('aboutEdit').addEventListener('blur', () => {
            const about = document.getElementById('aboutEdit').value;
            document.getElementById('aboutText').textContent = about;
            this.saveProfileData({ about });
            this.toggleEdit('about');
        });
    }

    loadProfile() {
        // Load basic info
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.currentUser.role === 'client' ? 'Client' : 'Freelancer';
        document.getElementById('userEmail').textContent = this.currentUser.email;

        // Load profile data
        const profileData = this.storage.getProfile(this.currentUser.id);
        if (profileData) {
            if (profileData.profilePicture) {
                document.getElementById('profilePicture').src = profileData.profilePicture;
            }
            if (profileData.about) {
                document.getElementById('aboutText').textContent = profileData.about;
            }
            if (profileData.skills) {
                profileData.skills.forEach(skill => this.renderSkill(skill));
            }
            if (profileData.portfolio) {
                profileData.portfolio.forEach(project => this.renderPortfolioItem(project));
            }
        }

        // Show/hide sections based on role
        if (this.currentUser.role === 'client') {
            document.getElementById('skillsSection').style.display = 'none';
            document.getElementById('portfolioSection').style.display = 'none';
        }
    }

    toggleEdit(section) {
        switch (section) {
            case 'about':
                const aboutText = document.getElementById('aboutText');
                const aboutEdit = document.getElementById('aboutEdit');
                if (aboutEdit.classList.contains('hidden')) {
                    aboutEdit.value = aboutText.textContent;
                    aboutText.classList.add('hidden');
                    aboutEdit.classList.remove('hidden');
                    aboutEdit.focus();
                } else {
                    aboutText.classList.remove('hidden');
                    aboutEdit.classList.add('hidden');
                }
                break;
            case 'skills':
                const skillInput = document.getElementById('skillInput');
                skillInput.classList.toggle('hidden');
                if (!skillInput.classList.contains('hidden')) {
                    skillInput.focus();
                }
                break;
            case 'portfolio':
                const portfolioForm = document.getElementById('portfolioForm');
                portfolioForm.classList.toggle('hidden');
                break;
        }
    }

    addSkill(skill) {
        const profileData = this.storage.getProfile(this.currentUser.id) || {};
        const skills = profileData.skills || [];
        if (!skills.includes(skill)) {
            skills.push(skill);
            this.saveProfileData({ skills });
            this.renderSkill(skill);
        }
    }

    renderSkill(skill) {
        const skillTags = document.getElementById('skillTags');
        const tag = document.createElement('div');
        tag.className = 'skill-tag';
        tag.textContent = skill;
        tag.onclick = () => {
            if (confirm('Remove this skill?')) {
                this.removeSkill(skill);
                tag.remove();
            }
        };
        skillTags.appendChild(tag);
    }

    removeSkill(skill) {
        const profileData = this.storage.getProfile(this.currentUser.id) || {};
        const skills = profileData.skills || [];
        const index = skills.indexOf(skill);
        if (index > -1) {
            skills.splice(index, 1);
            this.saveProfileData({ skills });
        }
    }

    saveProject() {
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const link = document.getElementById('projectLink').value;

        if (!title || !description) {
            alert('Please fill in all required fields');
            return;
        }

        const project = { title, description, link, id: Date.now() };
        const profileData = this.storage.getProfile(this.currentUser.id) || {};
        const portfolio = profileData.portfolio || [];
        portfolio.push(project);
        this.saveProfileData({ portfolio });
        this.renderPortfolioItem(project);
        this.toggleEdit('portfolio');

        // Clear form
        document.getElementById('projectTitle').value = '';
        document.getElementById('projectDescription').value = '';
        document.getElementById('projectLink').value = '';
    }

    renderPortfolioItem(project) {
        const portfolioItems = document.getElementById('portfolioItems');
        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.innerHTML = `
            <h3>${project.title}</h3>
            <p>${project.description}</p>
            ${project.link ? `<a href="${project.link}" target="_blank" class="btn-secondary">View Project</a>` : ''}
            <button onclick="profile.removeProject(${project.id})" class="btn-secondary" style="margin-top: 0.5rem">Remove</button>
        `;
        portfolioItems.appendChild(item);
    }

    removeProject(projectId) {
        if (confirm('Are you sure you want to remove this project?')) {
            const profileData = this.storage.getProfile(this.currentUser.id) || {};
            const portfolio = profileData.portfolio || [];
            const index = portfolio.findIndex(p => p.id === projectId);
            if (index > -1) {
                portfolio.splice(index, 1);
                this.saveProfileData({ portfolio });
                document.getElementById('portfolioItems').innerHTML = '';
                portfolio.forEach(project => this.renderPortfolioItem(project));
            }
        }
    }

    saveProfileData(data) {
        const currentData = this.storage.getProfile(this.currentUser.id) || {};
        const updatedData = { ...currentData, ...data };
        this.storage.updateProfile(this.currentUser.id, updatedData);
    }
}

// Global function for project saving (called from HTML)
function saveProject() {
    window.profile.saveProject();
}

// Global function for editing sections
function toggleEdit(section) {
    window.profile.toggleEdit(section);
} 