import {body} from "express-validator"

export const userSignUpValidation = [
    // Validate username
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required.')
      .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters.')
      .matches(/^[a-zA-Z0-9 ]+$/).withMessage('Username can only contain letters, numbers, and spaces.'),
  
    // Validate email
    body('email')
      .optional()
      .isEmail().withMessage('Invalid email address.')
      .normalizeEmail(),
  

    // Validate phone (optional)
    body('phone')
      .matches( /^(011|012|015|010)\d{8}$/).withMessage('Invalid phone number format.'),
  
    // Validate date of birth (optional)
    body('dob')
      .optional()
      .isISO8601().withMessage('Invalid date format. Use YYYY-MM-DD.')
      .custom((value) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        if (age < 18) {
          throw new Error('You must be at least 18 years old.');
        }
        return true;
      }),
      body("password")
  ];


  export const productQuantityValidation = [
    body('quantity')
    .isNumeric()
    .withMessage("Quantity must be a number")
    .isInt({min:0})
    .withMessage("cannt be negative")
    .optional()
  ];
