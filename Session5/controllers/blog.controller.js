const Blog = require("../models/blog.model");
const { blogPostValidator } = require("../libraries/validators/blog.validator");

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isActive: true });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postBlogs = async (req, res) => {
  const validationResult = blogPostValidator.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(400).json({ error: validationResult.error });
  }

  const { title, body, author } = validationResult.data;
  const ipAddress = req.ip;

  const blog = new Blog({ title, body, author, ipAddress });
  const result = await blog.save();
  res.json(result);
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or inactive" });
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
};

exports.patchBlogBySlug = async (req, res) => {
  req.body.ipAddress = req.ip;
  const result = await Blog.updateOne(
    { slug: req.params.slug },
    { $set: req.body }
  );
  res.json(result);
};

exports.deleteBlogBySlug = async (req, res) => {
  try {
    const result = await Blog.updateOne(
      { slug: req.params.slug },
      { isActive: false }
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.postComments = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or inactive" });
    }
    req.body.ipAddress = req.ip;
    blog.comments.push(req.body);
    await blog.save();
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getViews = async (req, res) => {
  try {
    const blog = await Blog.findOne({
      slug: req.params.slug,
      isActive: true,
    });
    if (!blog) {
      return res.status(404).json({ message: "Blog not found or inactive" });
    }
    const viewsList = blog.viewsList.map(
      (view) =>
        `${view.ipAddress} views ${blog.title} blog ${view.viewsCount} time${
          view.viewsCount > 1 ? "s" : ""
        }`
    );
    res.send(viewsList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
