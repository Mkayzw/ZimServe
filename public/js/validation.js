class FormValidator {
    static validateRegistration(formData) {
        const errors = [];
        
        // Name validation
        const name = formData.get('name');
        if (name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Email validation
        const email = formData.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        }

        // Password validation
        const password = formData.get('password');
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        return errors;
    }

    static validateJobPost(formData) {
        const errors = [];
        
        const title = formData.get('title');
        if (title.length < 5) {
            errors.push('Job title must be at least 5 characters long');
        }

        const description = formData.get('description');
        if (description.length < 20) {
            errors.push('Job description must be at least 20 characters long');
        }

        const budget = Number(formData.get('budget'));
        if (isNaN(budget) || budget <= 0) {
            errors.push('Please enter a valid budget amount');
        }

        return errors;
    }
} 