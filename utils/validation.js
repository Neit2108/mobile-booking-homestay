/**
 * Validate an email address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  /**
   * Validate a phone number
   * @param {string} phone - The phone number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export const isValidPhone = (phone) => {
    // Remove any non-digit characters
    const digitsOnly = phone.replace(/\D/g, '');
    // Most phone numbers are between 10 and 15 digits
    return digitsOnly.length >= 10 && digitsOnly.length <= 15;
  };
  
  /**
   * Validate password strength (minimum 6 characters)
   * @param {string} password - The password to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export const isValidPassword = (password) => {
    return password && password.length >= 6;
  };
  
  /**
   * Validate that the field is not empty
   * @param {string} value - The value to check
   * @returns {boolean} - True if not empty, false otherwise
   */
  export const isNotEmpty = (value) => {
    return value && value.trim().length > 0;
  };
  
  /**
   * Validate that the Identity Card number is 12 digits
   * @param {string} idCard - The ID card number to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export const isValidIdCard = (idCard) => {
    // Remove any non-digit characters
    const digitsOnly = idCard.replace(/\D/g, '');
    return digitsOnly.length === 12;
  };
  
  /**
   * Validate that the username is at least 4 characters
   * @param {string} username - The username to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  export const isValidUsername = (username) => {
    return username && username.length >= 4;
  };
  
  /**
   * Form validation helper - returns all validation errors
   * @param {Object} data - The form data
   * @param {Object} rules - The validation rules
   * @returns {Object} - Validation errors
   */
  export const validateForm = (data, rules) => {
    const errors = {};
    
    Object.keys(rules).forEach(field => {
      const fieldRules = rules[field];
      const value = data[field];
      
      fieldRules.forEach(rule => {
        // Skip validation if value is empty and the rule is not 'required'
        if (!value && rule.type !== 'required') return;
        
        switch (rule.type) {
          case 'required':
            if (!isNotEmpty(value)) {
              errors[field] = rule.message || `${field} is required`;
            }
            break;
          case 'email':
            if (!isValidEmail(value)) {
              errors[field] = rule.message || 'Invalid email format';
            }
            break;
          case 'phone':
            if (!isValidPhone(value)) {
              errors[field] = rule.message || 'Invalid phone number format';
            }
            break;
          case 'password':
            if (!isValidPassword(value)) {
              errors[field] = rule.message || 'Password must be at least 6 characters';
            }
            break;
          case 'idCard':
            if (!isValidIdCard(value)) {
              errors[field] = rule.message || 'Identity Card must be 12 characters';
            }
            break;
          case 'username':
            if (!isValidUsername(value)) {
              errors[field] = rule.message || 'Username must be at least 4 characters';
            }
            break;
          case 'minLength':
            if (value.length < rule.value) {
              errors[field] = rule.message || `Minimum length is ${rule.value} characters`;
            }
            break;
          case 'maxLength':
            if (value.length > rule.value) {
              errors[field] = rule.message || `Maximum length is ${rule.value} characters`;
            }
            break;
          case 'custom':
            if (!rule.validator(value, data)) {
              errors[field] = rule.message || 'Invalid value';
            }
            break;
        }
      });
    });
    
    return errors;
  };