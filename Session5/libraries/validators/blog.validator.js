const { z } = require("zod");

const abusiveWords = ["idiot", "stupid", "dumb"];

const containsAbusiveWords = (value) => {
  const lowercasedValue = value.toLowerCase();
  return abusiveWords.some((word) => lowercasedValue.includes(word));
};

const blogPostValidator = z.object({
  title: z.string().refine((value) => !containsAbusiveWords(value), {
    message: "Title contains abusive words",
  }),
  body: z.string().refine((value) => !containsAbusiveWords(value), {
    message: "Body contains abusive words",
  }),
  author: z.string(),
});

module.exports = { blogPostValidator };
