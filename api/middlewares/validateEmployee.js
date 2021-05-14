const { check, validationResult } = require("express-validator");

  const validationWare = [
    check("firstName")
      .exists()
      .withMessage("firstname is required")
      .isLength({ min: 2 })
      .withMessage("the first name cannot be less than 2 characters")
      .trim(),

    check("lastName")
    .optional()
    .isLength({ min: 2 })
    .withMessage("the last name cannot be less than 2 characters")
    .trim(),

    check("email")
      .exists()
      .withMessage("email is required")
      .trim()
      .isEmail()
      .withMessage("invalid email address")
      .normalizeEmail(),

    check("phone_number")
      .optional()
      .isInt()
      .withMessage("phone number should be numbers only")
      .isLength({ min: 7 })
      .withMessage("the phone number cannot be less than 7 characters")
      .trim(),

      check("role")
      .exists()
      .withMessage("role is required")
      .isIn(['superadmin','admin','employee', 'driver'])
      .withMessage("this role does not exist")
      .trim(),

      check("category")
      .exists()
      .withMessage("category is required")
      .isIn(['senior executive','executive','senior staff','staff'])
      .withMessage("this category does not exist")
      .trim(),

    

    // check("password")
    //   .isLength({ min: 8, max: 15 })
    //   .withMessage("your password should have min and max length between 8-15")
    //   .matches(/\d/)
    //   .withMessage("your password should have at least one number")
    //   .matches(/[!@#$%^&*(),.?":{}|<>]/)
    //   .withMessage("your password should have at least one sepcial character"),

    // check("confirmPassword").custom((value, { req }) => {
    //   if (value !== req.body.password) {
    //     throw new Error("confirm password does not match");
    //   }
    //   return true;
    // }),
  ]


module.exports = validationWare;