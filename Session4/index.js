/* Put DB Password before running it */
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const slugify = require("slugify");
const rateLimit = require("express-rate-limit");

app.use(express.json());

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message:
    "You have exceeded the 10 requests in 1 minute limit!, Please try after 1 minute",
});

async function run() {
  try {
    await mongoose.connect(
      "mongodb+srv://gatiyalap:<PASSWORD>@cluster0.dbo8sjz.mongodb.net/blogapplication?retryWrites=true&w=majority&appName=Cluster0",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("Connected to MongoDB");

    const blogSchema = new mongoose.Schema({
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
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
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
          createdAt: {
            type: Date,
            default: Date.now,
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
    });

    blogSchema.pre("save", function (next) {
      if (this.isModified("title")) {
        const uniqueID = new mongoose.Types.ObjectId().toString();
        this.slug =
          slugify(this.title, { lower: true, strict: true }) + "-" + uniqueID;
      }
      next();
    });

    const Blog = mongoose.model("Blog", blogSchema);

    app.get("/blogs", async (req, res) => {
      try {
        const blogs = await Blog.find({ isActive: true });
        res.json(blogs);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    const isBlogAbusive = (blog) => {
      const abusiveWords = ["idiot", "stupid", "dumb"];
      const body = blog.body.toLowerCase();
      const title = blog.title.toLowerCase();
      const abusiveWord = abusiveWords.some((word) => body.includes(word));
      const abusiveTitleWord = abusiveWords.some((word) =>
        title.includes(word)
      );
      return abusiveWord || abusiveTitleWord;
    };

    app.post("/blogs", rateLimiter, async (req, res) => {
      req.body.ipAddress = req.ip;

      if (isBlogAbusive(req.body)) {
        return res
          .status(400)
          .json({ message: "Abusive words are not allowed" });
      }
      const blog = new Blog(req.body);
      const result = await blog.save();
      res.json(result);
    });

    app.get("/blogs/:slug", async (req, res) => {
      try {
        const blog = await Blog.findOne({
          slug: req.params.slug,
          isActive: true,
        });
        if (!blog) {
          return res
            .status(404)
            .json({ message: "Blog not found or inactive" });
        }
        blog.views += 1;
        const ipAddress = req.ip;
        const viewIndex = blog.viewsList.findIndex(
          (view) => view.ipAddress === ipAddress
        );
        if (viewIndex === -1) {
          blog.viewsList.push({ ipAddress, viewsCount: 1 });
        } else {
          blog.viewsList[viewIndex].viewsCount += 1;
          // A perticular ip can not view a particular blog more than 10 times.
          if (blog.viewsList[viewIndex].viewsCount > 10) {
            return res
              .status(400)
              .json({ message: "You have reached maximum views limit" });
          }
        }

        await blog.save();
        res.json(blog);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.patch("/blogs/:slug", async (req, res) => {
      req.body.ipAddress = req.ip;
      const result = await Blog.updateOne(
        { slug: req.params.slug },
        { $set: req.body }
      );
      res.json(result);
    });

    app.delete("/blogs/:slug", async (req, res) => {
      try {
        const result = await Blog.updateOne(
          { slug: req.params.slug },
          { isActive: false }
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.post("/blogs/:slug/comments", rateLimiter, async (req, res) => {
      try {
        const blog = await Blog.findOne({
          slug: req.params.slug,
          isActive: true,
        });
        if (!blog) {
          return res
            .status(404)
            .json({ message: "Blog not found or inactive" });
        }
        req.body.ipAddress = req.ip;
        blog.comments.push(req.body);
        await blog.save();
        res.json(blog);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    app.get("/blogs/:slug/views", async (req, res) => {
      try {
        const blog = await Blog.findOne({
          slug: req.params.slug,
          isActive: true,
        });
        if (!blog) {
          return res
            .status(404)
            .json({ message: "Blog not found or inactive" });
        }
        const viewsList = blog.viewsList.map(
          (view) =>
            `${view.ipAddress} views ${blog.title} blog ${
              view.viewsCount
            } time${view.viewsCount > 1 ? "s" : ""}`
        );
        res.send(viewsList);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  } catch (err) {
    console.log(err);
  }
}
run();
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
