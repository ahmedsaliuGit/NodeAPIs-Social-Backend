const mongoose = require("mongoose");
const uuidv1 = require("uuid/v1");
const crypto = require("crypto");

const { ObjectId } = mongoose.Schema;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  email: {
    type: String,
    trim: true,
    required: true
  },
  hashed_password: {
    type: String,
    required: true
  },
  salt: String,
  created: {
    type: Date,
    default: Date.now
  },
  updated: Date,
  photo: {
    data: Buffer,
    contentType: String
  },
  about: {
    type: String,
    trim: true
  },
  following: [{ type: ObjectId, ref: "User" }],
  followers: [{ type: ObjectId, ref: "User" }],
  resetPasswordLink: {
    data: String,
    default: ""
  },
  role: {
    type: String,
    default: "subscriber"
  }
});

// virtual field
userSchema
  .virtual("password")
  .set(function(password) {
    // create a temporary _password
    this._password = password;
    // salt, use timestamp as salt
    this.salt = uuidv1();
    // method encryptPassword
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

userSchema.methods = {
  authenticate: function(pass) {
    return this.encryptPassword(pass) === this.hashed_password;
  },
  encryptPassword: function(password) {
    if (!password) return "";

    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (error) {
      return "";
    }
  }
};

module.exports = mongoose.model("User", userSchema);
