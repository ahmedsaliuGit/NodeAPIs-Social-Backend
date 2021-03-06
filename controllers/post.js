const Post = require("../models/post");
const formidable = require("formidable");
const fs = require("fs");
const _ = require("lodash");

exports.postById = (req, res, next, id) => {
  Post.findById(id)
    .populate("postedBy", "_id name role")
    .populate("comments.postedBy", "_id name")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(400).json({ error: err });
      }

      req.post = post;
      next();
    });
};

exports.getPosts = async (req, res) => {
  //   res.send("Hello from express app Nodemon, controller in action");
  // get current page from req.query or use default value of 1
  const currentPage = req.query.page || 1;

  // return posts per page or 3
  const perPage = req.query.perPage ? parseInt(req.query.perPage) : 3;
  let totalItems;

  const posts = await Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .populate("postedBy", "_id name role")
        .populate("comments.postedBy", "_id name")
        .sort({ created: -1 })
        .limit(perPage)
        .select("_id title body likes created comments");
    })
    .then((posts) => {
      res.json(posts);
    })
    .catch((error) => console.log(error));
};

exports.singlePost = (req, res) => {
  return res.json(req.post);
};

exports.createPost = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Image can not be uploaded" });
    }

    let post = new Post(fields);
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    post.postedBy = req.profile;

    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }

    post.save((err, post) => {
      if (err) {
        return res.status(400).json({ error: err });
      }
      res.json({ post });
    });
  });
};

exports.postsByUser = (req, res) => {
  Post.find({ postedBy: req.profile._id })
    .populate("postedBy", "_id name role")
    .select("_id title body likes created")
    .sort({ created: -1 })
    .exec((err, posts) => {
      if (err) {
        return res.status(400).json({ error: err });
      }

      res.json(posts);
    });
};

exports.isPoster = (req, res, next) => {
  let owner = req.post && req.auth && req.post.postedBy._id == req.auth._id;
  let adminUser = req.post && req.auth && req.auth.role == "admin";

  let isPoster = owner || adminUser;
  console.log("req.auuth ", req.auth, " req.post", req.post);
  console.log("OWNER::", owner, " ADMINUSER:: ", adminUser);

  if (!isPoster) {
    return res.status(403).json({ error: "User is not authorized" });
  }
  next();
};

// exports.updatePost = (req, res) => {
//   let post = req.post;
//   post = _.extend(post, req.body);
//   post.updated = Date.now();

//   post.save(err => {
//     if (err) {
//       return res.status(400).json({ error: err });
//     }

//     res.json(post);
//   });
// };

exports.updatePost = (req, res, next) => {
  let form = new formidable.IncomingForm();

  form.keepExtensions = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: "Image can not be uploaded" });
    }

    // save user
    let post = req.post;
    post = _.extend(post, fields);
    post.updated = Date.now();

    if (files.photo) {
      post.photo.data = fs.readFileSync(files.photo.path);
      post.photo.contentType = files.photo.type;
    }

    post.save((err, result) => {
      if (err) {
        return res.status(400).json({
          error: "Error updating the post profile",
          err,
        });
      }

      res.json(post);
    });
  });
};

exports.photo = (req, res) => {
  res.set("Content-type", req.post.photo.contentType);
  return res.send(req.post.photo.data);
};

exports.deletePost = (req, res) => {
  let post = req.post;
  post.remove((err, post) => {
    if (err) {
      return res.status(400).json({ error: err });
    }

    res.json({ message: "Post deleted successfully" });
  });
};

exports.like = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({ error: err });
    } else {
      res.json(result);
    }
  });
};

exports.unlike = (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likes: req.body.userId } },
    { new: true }
  ).exec((err, result) => {
    if (err) {
      return res.status(400).json({ error: err });
    } else {
      res.json(result);
    }
  });
};

exports.comment = (req, res) => {
  let comment = req.body.comment;
  comment.postedBy = req.body.userId;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { comments: comment } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      } else {
        res.json(result);
      }
    });
};

exports.uncomment = (req, res) => {
  let comment = req.body.comment;

  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { comments: { _id: comment._id } } },
    { new: true }
  )
    .populate("comments.postedBy", "_id name")
    .populate("postedBy", "_id name")
    .exec((err, result) => {
      if (err) {
        return res.status(400).json({ error: err });
      } else {
        res.json(result);
      }
    });
};
