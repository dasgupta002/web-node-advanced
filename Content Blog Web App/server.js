const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/post");
const postsRouter = require("./routes/posts");
const app = express();

mongoose.connect("mongodb+srv://blog:100@cluster0.44mmo.mongodb.net/blog?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
        .catch((error) => next(error));

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.use("/posts", postsRouter);

app.get("/", async (req, res) => {
    const posts = await Post.find().sort({createdOn: 'desc'});

    res.render("home", { posts: posts });
});

app.listen(200);
