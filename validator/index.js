exports.createPostValidator = (req, res, next) => {
  // validate title
  req.check("title", "Write a Title").notEmpty();
  req
    .check("title", "Title can only be between 4 and 150")
    .isLength({ min: 4, max: 150 });

  // validate body
  req.check("body", "Write a Body").notEmpty();
  req
    .check("body", "Body can only be between 4 and 2000")
    .isLength({ min: 4, max: 2000 });

  // check for errors
  const errors = req.validationErrors();

  // if there are errors show the first error.
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    res.status(400).json({ error: firstError });
  }

  // proceed to the next middleware
  next();
};

// validation for userSignup
exports.userSignupValidator = (req, res, next) => {
  // name can not be null
  req.check("name", "Name is required").notEmpty();
  // email can not be null, valid and normalize
  req.check("email", "Email is required");
  req
    .check("email")
    .matches(/.+\@.+\..+/)
    .withMessage("Email must contain @ character")
    .isLength({ min: 4, max: 2000 });
  // Password validation
  req.check("password", "Password is required").notEmpty();
  req
    .check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/\d/)
    .withMessage("Password must at least contain a number");

  // errors
  // check for errors
  const errors = req.validationErrors();

  // if there are errors show the first error.
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    res.status(400).json({ error: firstError });
  }

  // proceed to the next middleware
  next();
};

exports.passwordResetValidator = (req, res, next) => {
  // check for password
  req.check("newPassword", "Password is required").notEmpty();
  req
    .check("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 chars long")
    .matches(/\d/)
    .withMessage("must contain a number")
    .withMessage("Password must contain a number");

  // check for errors
  const errors = req.validationErrors();
  // if error show the first one as they happen
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).json({ error: firstError });
  }
  // proceed to next middleware or ...
  next();
};
