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
      type: mongoose.SchemaType.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: [tokenTypes.ACCESS, tokenTypes.REFRESH, tokenTypes.VERTIFY_EMAIL, tokenTypes.RESET_PASSWORD],
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
