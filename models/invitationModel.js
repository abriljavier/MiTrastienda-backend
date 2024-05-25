const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Invitation = mongoose.model("Invitation", invitationSchema);
module.exports = Invitation;
