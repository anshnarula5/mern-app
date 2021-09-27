const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Profile = require("../../models/Profile");

//@route  POST api/post
//@desc   Add a post
//@access private
const validatePost = [check("text", "Text is required").not().isEmpty()];
router.post("/", [auth, validatePost], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    });
    const post = await newPost.save();
    return res.json(post);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server Error");
  }
});

//@route  GET api/posts
//@desc   Get all posts
//@access private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;

//@route  GET api/posts/:id
//@desc   Get post by ID
//@access private

router.get("/:postId", auth, async (req, res) => {
  try {
    const { postId } = req.params;
    if (!postId) {
      return res.status(404).json({ msg: "No Post found" });
    }
    const post = await Post.findById(postId);
    res.json(post);
  } catch (error) {
    console.log(error.message);
    if (error.name === "CastError") {
      return res.status(404).json({ msg: "No Post found" });
    }
    return res.status(500).send("Server Error");
  }
});

//@route  GET api/posts
//@desc   Get all posts
//@access private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No Post found" });
    }
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }
    await post.remove();
    res.json({ msg: "Post deleted" });
  } catch (error) {
    console.log(error.message);
    if (!id) {
      return res.status(404).json({ msg: "No Post found" });
    }
    return res.status(500).send("Server Error");
  }
});

//@route  PUT posts/likes/:id
//@desc   Like a post
//@access private

router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No Post found" });
    }
    const prevLike = post.likes.find(
      (like) => like.user.toString() === req.user.id
    );
    if (prevLike) {
      return res.status(400).json({ msg: "Post already Liked" });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server Error");
  }
});
//@route  PUT posts/dislikes/:id
//@desc   Dislike a post
//@access private

router.put("/dislike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No Post found" });
    }
    const prevLike = post.likes.find(
      (like) => like.user.toString() === req.user.id
    );
    if (!prevLike) {
      return res.status(400).json({ msg: "You have not liked the post yet" });
    }
    prevLike.remove();
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server Error");
  }
});

//@route  POST api/comments/:id
//@desc   Add a Comment
//@access private

const validateComment = [check("text", "Text is required").not().isEmpty()];

router.post("/comment/:id", [auth, validatePost], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id).select("-password");
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "No post found" });
    }
    const newComment = {
      text: req.body.text,
      user: req.user.id,
      name: user.name,
      avatar: user.avatar,
      date: Date.now(),
    };
    post.comments.unshift(newComment);
    await post.save();
    return res.json(post);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Server Error");
  }
});

//@route  DELETE api/comment/:id
//@desc   delete a comment
//@access private

router.delete("/comment/:id/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = post.comments.find(
      (comment) => comment.id === req.params.commentId
      );
      if (!comment) {
          return res.status(400).json({msg : "No comment found"})
      }
      if (comment.user.toString() !== req.user.id) {
          return res.status(401).json({msg : "Not authorised"})
      }
      comment.remove()
      await post.save()
      res.json(post)
  } catch (error) {
    console.log(error.message);
    if (!id || !commentId) {
      return res.status(404).json({ msg: "No Post or comment found" });
    }
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
