const mongoose = require("mongoose");
const tokenTypes = require("./tokenTypes");

const tokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.VERIFY_EMAIL, tokenTypes.RESET_PASSWORD],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * @typedef Token
 */
const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
