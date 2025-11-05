// controllers/usersController.js
const { render, name } = require("ejs");
const usersStorage = require("../storages/usersStorage");
const {
  body,
  query,
  validationResult,
  matchedData,
} = require("express-validator");

const alphaErr = "Must contain only letters";
const lengthErr = "Must be between 1 and 10 characters";
const emailErr = "Enter a valid email adress";
const ageErr = "You must be between 18-120";

const validateUser = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),

  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),

  body("email").trim().isEmail().withMessage(emailErr),

  body("age").trim().isNumeric().withMessage(ageErr),

  body("bio").trim().escape().optional({ checkFalsy: true }),
];

const validateSearch = [
  query("username")
    .trim()
    .optional()
    .isAlpha()
    .withMessage("A name only contains letters"),

  query("mail")
    .trim()
    .optional()
    .isEmail()
    .withMessage("Must enter a valid email"),
];

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("createUser", {
        title: "Create user",
        errors: errors.array(),
      });
    }

    const { firstName, lastName, email, age, bio } = matchedData(req);
    usersStorage.addUser({ firstName, lastName, email, age, bio });
    res.redirect("/");
  },
];

exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render("updateUser", {
    title: "Update user",
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("updateUser", {
        title: "Update user",
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = matchedData(req);
    usersStorage.updateUser(req.params.id, {
      firstName,
      lastName,
      email,
      age,
      bio,
    });
    res.redirect("/");
  },
];

exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect("/");
};

exports.userSearchFormGet = [
  validateSearch,
  (req, res) => {
    const { username, mail } = req.query;

    if (!username && !mail) {
      return res.render("searchUser.ejs", { results: null });
    }

    const DB = usersStorage.getUsers();

    const results = DB.filter((u) => {
      console.log(u);
      return (
        u.email === mail ||
        `${u.firstName} ${u.lastName}`.toLowerCase().trim() ===
          username.toLowerCase().trim()
      );
    });

    console.log(results);

    res.render("searchUser", { results });
  },
];
