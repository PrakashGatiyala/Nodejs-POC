const { Schema, model, Types } = require("mongoose");
const slugify = require("slugify");

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    body: {
      type: String,
    },
    author: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    ipAddress: {
      type: String,
    },
    comments: [
      {
        author: {
          type: String,
          required: true,
        },
        body: {
          type: String,
        },
        ipAddress: {
          type: String,
        },
      },
    ],
    viewsList: [
      {
        ipAddress: {
          type: String,
        },
        viewsCount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    const uniqueID = new Types.ObjectId().toString();
    this.slug =
      slugify(this.title, { lower: true, strict: true }) + "-" + uniqueID;
  }
  next();
});

const Blog = model("Blog", blogSchema);

module.exports = Blog;
