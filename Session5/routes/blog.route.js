const express = require("express");
const rateLimit = require("express-rate-limit");
const controller = require("../controllers/blog.controller");

const router = express.Router();

const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message:
    "You have exceeded the 10 requests in 1 minute limit!, Please try after 1 minute",
});

router.get("/", controller.getBlogs);

router.post("/", rateLimiter, controller.postBlogs);

router.get("/:slug", controller.getBlogBySlug);

router.patch("/:slug", controller.patchBlogBySlug);

router.delete("/:slug", controller.deleteBlogBySlug);

router.post("/:slug/comments", rateLimiter, controller.postComments);

router.get("/:slug/views", controller.getViews);

module.exports = router;
