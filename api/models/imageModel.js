const { DateTime } = require("luxon");

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ImageSchema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    image: {
      data: Buffer,
      type: Object,
      required: true,
    },
    date: { type: Date, default: new Date() },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { toJSON: { virtuals: true } }
);

ImageSchema.virtual("date_med").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATE_MED);
});

ImageSchema.virtual("time_simple").get(function () {
  return DateTime.fromJSDate(this.date).toLocaleString(DateTime.TIME_SIMPLE);
});

// Export model
module.exports = mongoose.model("Image", ImageSchema);
