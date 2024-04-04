const { DateTime } = require("luxon");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, refPath: "chatModel", required: true },
    text: {
      type: String,
      minLength: 1,
      maxLength: 10000,
    },
    image: {
      data: Buffer,
    },
    date: { type: Date, default: new Date() },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    chatModel: {
      type: String,
      enum: ["Chat", "Group"],
      required: true,
    },
  },
  { toJSON: { virtuals: true } }
);

MessageSchema.virtual("date_med").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

MessageSchema.virtual("time_simple").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.TIME_SIMPLE);
});

// Export model
module.exports = mongoose.model("Message", MessageSchema);
