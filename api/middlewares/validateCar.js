const { check, validationResult } = require("express-validator");

  const validationWare = [
    check("plate_number")
      .exists()
      .withMessage("plate number is required")
      .isLength({ min: 5 })
      .withMessage("the plate number cannot be less than 5 characters")
      .trim(),

    check("brand")
      .exists()
      .withMessage("brand is required")
      .trim(),

    check("model")
      .exists()
      .withMessage("model is required")
      .trim(),

    check("color")
      .exists()
      .withMessage("color is required")
      .trim(),

    check("properties")
      .optional()
      .trim(),

      check("status")
      .exists()
      .withMessage("status is required")
      .isIn(['available','unavailable','booked'])
      .withMessage("this status does not exist")
      .trim(),

      check("category")
      .exists()
      .withMessage("category is required")
      .isIn(['senior executive','executive','senior staff','staff'])
      .withMessage("this category does not exist")
      .trim(),

  ]


module.exports = validationWare;