const express = require("express");
const router = express.Router();
const Post = require("../models/post");

router.get("/create", (req, res) => {
    res.render("create", { post: new Post() });
});


router.get("/edit/:id", async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render("edit", { post: post });
});

router.get("/:slug", async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug });
    
    if(post == null) res.redirect("/");
    res.render("show", { post: post });
});

router.post("/:id", async (req, res) => {
    await Post.findByIdAndDelete(req.params.id);
    res.redirect("/");
});

router.post("/update/:id", async (req, res) => {
    const update = {
        heading: req.body.heading,
        metadata: req.body.metadata,
        body: req.body.body
    };

    await Post.findByIdAndUpdate(req.params.id, update);
    res.redirect("/");
});

router.post("/", async (req, res) => {
    let post = new Post({
        heading: req.body.heading,
        metadata: req.body.metadata,
        body: req.body.body
    });

    try {
        const feed = await post.save();
        res.redirect(`/posts/${feed.slug}`);
    } catch (error) {
        res.render("create", { post: post });
    }
});

module.exports = router;