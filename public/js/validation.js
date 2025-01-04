class FormValidator {
    static validateRegistration(formData) {
        const errors = [];
        
        // Name validation with sanitization
        const name = (formData.get('name') || '').trim();
        if (!name) {
            errors.push('Name is required');
        } else if (name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        } else if (name.length > 100) {
            errors.push('Name must not exceed 100 characters');
        } else if (!/^[a-zA-Z\s-']+$/.test(name)) {
            errors.push('Name can only contain letters, spaces, hyphens, and apostrophes');
        }

        // Email validation with strict regex
        const email = (formData.get('email') || '').trim().toLowerCase();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email) {
            errors.push('Email is required');
        } else if (!emailRegex.test(email)) {
            errors.push('Please enter a valid email address');
        } else if (email.length > 254) { // RFC 5321
            errors.push('Email address is too long');
        }

        // Password validation with enhanced security rules
        const password = formData.get('password') || '';
        if (!password) {
            errors.push('Password is required');
        } else {
            if (password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }
            if (password.length > 128) {
                errors.push('Password must not exceed 128 characters');
            }
            if (!/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (!/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (!/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors.push('Password must contain at least one special character');
            }
        }

        // Role validation
        const role = formData.get('role');
        if (!role) {
            errors.push('Please select a role');
        } else if (!['client', 'freelancer'].includes(role)) {
            errors.push('Invalid role selected');
        }

        return errors;
    }

    static validateJobPost(formData) {
        const errors = [];
        
        // Title validation with sanitization
        const title = (formData.get('title') || '').trim();
        if (!title) {
            errors.push('Job title is required');
        } else if (title.length < 5) {
            errors.push('Job title must be at least 5 characters long');
        } else if (title.length > 200) {
            errors.push('Job title must not exceed 200 characters');
        }

        // Description validation with sanitization
        const description = (formData.get('description') || '').trim();
        if (!description) {
            errors.push('Job description is required');
        } else if (description.length < 20) {
            errors.push('Job description must be at least 20 characters long');
        } else if (description.length > 5000) {
            errors.push('Job description must not exceed 5000 characters');
        }

        // Budget validation
        const budgetStr = formData.get('budget');
        const budget = Number(budgetStr);
        if (!budgetStr) {
            errors.push('Budget is required');
        } else if (isNaN(budget) || budget <= 0) {
            errors.push('Please enter a valid budget amount');
        } else if (budget > 1000000) {
            errors.push('Budget amount exceeds maximum limit');
        } else if (!Number.isInteger(budget)) {
            errors.push('Budget must be a whole number');
        }

        return errors;
    }

    static validateApplication(formData) {
        const errors = [];

        // Cover Letter validation
        const coverLetter = (formData.get('coverLetter') || '').trim();
        if (!coverLetter) {
            errors.push('Cover letter is required');
        } else if (coverLetter.length < 50) {
            errors.push('Cover letter must be at least 50 characters long');
        } else if (coverLetter.length > 2000) {
            errors.push('Cover letter must not exceed 2000 characters');
        }

        // Proposed Rate validation (optional field)
        const proposedRate = formData.get('proposedRate');
        if (proposedRate) {
            const rate = Number(proposedRate);
            if (isNaN(rate) || rate <= 0) {
                errors.push('Please enter a valid proposed rate');
            } else if (rate > 1000000) {
                errors.push('Proposed rate exceeds maximum limit');
            } else if (!Number.isInteger(rate)) {
                errors.push('Proposed rate must be a whole number');
            }
        }

        // Availability validation
        const availability = formData.get('availability');
        if (!availability) {
            errors.push('Please select your availability');
        } else if (!['immediate', '1week', '2weeks', 'custom'].includes(availability)) {
            errors.push('Invalid availability option selected');
        }

        return errors;
    }
} 