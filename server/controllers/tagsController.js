const Tag = require('../model/Tag');
const User = require('../model/User');
const Post = require('../model/Post');
const { unCapitalizeFirstLetter } = require('../helpers/string');

const getTags = async (req, res) => {
  const tags = await Tag.find({}).sort({ followers: -1 });

  res.status(200).json(tags);
};

const getFollowingTags = async (req, res) => {
  const { userId } = req.params;
  const tags = await Tag.find({ followers: userId }).limit(6).sort({ followers: -1 });

  res.status(200).json(tags);
};

const getNumTags = async (req, res) => {
  const tags = await Tag.find({})
    .limit(3)
    .sort({ posts: -1 })
    .populate({ path: 'posts', populate: 'author' });

  res.status(200).json(tags);
};

const getTagByName = async (req, res) => {
  const tag = await Tag.findOne({ name: req.params.name }).populate('posts').exec();

  res.status(200).json(tag);
};

const createTags = async (tags, post) => {
  tags.forEach(tag => {
    (async () => {
      const postTag = await Tag.findOneAndUpdate(
        { name: tag },
        { $addToSet: { posts: post._id } },
        { upsert: true, new: true }
      );
      await Post.updateOne({ _id: post._id }, { $addToSet: { tags: postTag._id } });
    })();
  });
};

const deleteTags = async (tags, post, isPostDeletion) => {
  for (const [i, tag] of post.tags.entries()) {
    if (isPostDeletion ? tags.includes(tag.name) : !tags.includes(tag.name)) {
      const postTag = await Tag.findOneAndUpdate(
        { _id: post.tags[i]._id },
        { $pull: { posts: post._id } }
      );
      await Post.updateOne({ _id: post._id }, { $pull: { tags: post.tags[i]._id } });
      if (postTag.posts.length === 1) await Tag.deleteOne({ name: tag.name });
    }
  }
};

const updateTags = async (tags, post) => {
  await createTags(tags, post);
  await deleteTags(tags, post, false);
};

const handleFollow = async (req, res) => {
  const { name, action } = req.params;
  const { userId, tagId } = req.body;
  const isUndoing = action.includes('un');

  const updatedTag = await Tag.findOneAndUpdate(
    { name },
    isUndoing ? { $pull: { followers: userId } } : { $addToSet: { followers: userId } }
  );
  await User.findOneAndUpdate(
    { _id: userId },
    isUndoing ? { $pull: { followedTags: tagId } } : { $addToSet: { followedTags: tagId } }
  );

  res.json(updatedTag).status(200);
};

module.exports = {
  getTags,
  getNumTags,
  getFollowingTags,
  getTagByName,
  createTags,
  updateTags,
  deleteTags,
  handleFollow,
};
