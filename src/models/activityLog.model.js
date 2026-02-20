import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    issue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "ISSUE_CREATED",
        "ISSUE_ASSIGNED",
        "STATUS_CHANGED",
        "ISSUE_CLOSED",
      ],
      required: true,
    },

    from: {
      type: String,
    },

    to: {
      type: String,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;