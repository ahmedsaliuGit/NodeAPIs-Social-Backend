const express = require("express");

const {
  userById,
  allUser,
  getUser,
  updateUser,
  deleteUser,
  userPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople,
  hasAuthorization
} = require("../controllers/user");
const { requireSignin } = require("../controllers/auth");

const router = express.Router();

router.put("/user/follow", requireSignin, addFollowing, addFollower);
router.put("/user/unfollow", requireSignin, removeFollowing, removeFollower);

router.get("/users", allUser);
router.get("/user/:userId", requireSignin, getUser);
router.put("/user/:userId", requireSignin, hasAuthorization, updateUser);
router.delete("/user/:userId", requireSignin, hasAuthorization, deleteUser);

//whom to follow
router.get("/user/findpeople/:userId", requireSignin, findPeople);

// photo
router.get("/user/photo/:userId", userPhoto);

// any route containing user id will execute userById()
router.param("userId", userById);

module.exports = router;
