import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  role: {
    type: String,
    enum: ["user", "driver", "admin"],
    required: true,
    default: "user"
  }
}, { timestamps: true });

// Add index for faster queries
userSchema.index({ clerkId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);