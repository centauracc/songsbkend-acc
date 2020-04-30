const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    const rounds = 10;
    this.password = await bcrypt.hash(this.password, rounds);
  }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
