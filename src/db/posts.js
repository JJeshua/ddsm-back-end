import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  post_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  post_content: {
    type: String,
    required: true,
  },
  post_timestamp: {
    type: Date,
    default: Date.now,
  },
  post_is_archived: {
    type: Boolean,
    default: false,
    select: false,
  },
  post_like_count: {
    type: Number,
    default: 0,
  },
  post_comment_count: {
    type: Number,
    default: 0,
  },
});

export const PostsModel = mongoose.model('Post', postSchema);

/**
 * Retrieves a post by its ID.
 *
 * @param {string} id - The ID of the post.
 * @returns {Promise<object|null>} - A promise that resolves to the post object if found, or null if not found.
 */
export const getPostById = async (id) => {
  return PostsModel.findById(id);
};

/**
 * Retrieves posts by user ID with pagination.
 *
 * @param {string} user_id - The ID of the user who owns the posts.
 * @param {number} page - The page number for pagination.
 * @returns {Promise<object[]>} - A promise that resolves to an array of post objects.
 */
export const getPostsByUserId = async (user_id, page) => {
  return PostsModel.find({ post_owner_id: user_id })
    .skip((page - 1) * itemsToFetch)
    .limit(itemsToFetch);
};

/**
 * Creates a new post.
 *
 * @param {object} values - The values to create the new post.
 * @returns {Promise<object>} - A promise that resolves to the created post object.
 */
export const createNewPost = async (values) => {
  return PostsModel(values).save();
};

/**
 * Archives a post.
 *
 * @param {object} post - The post to be archived.
 * @returns {Promise<object>} - A promise that resolves to the updated post object.
 */
export const archivePost = async (post) => {
  post.post_is_archived = true;
  return post.save();
};

/**
 * Unarchives a post.
 *
 * @param {object} post - The post to be unarchived.
 * @returns {Promise<object>} - A promise that resolves to the updated post object.
 */
export const unarchivePost = async (post) => {
  post.post_is_archived = false;
  return post.save();
};

/**
 * Updates a post by its ID.
 *
 * @param {string} id - The ID of the post to be updated.
 * @param {object} values - The values to update the post with.
 * @returns {Promise<object|null>} - A promise that resolves to the updated post object if found, or null if not found.
 */
export const postUpdate = async (id, values) => {
  return PostsModel.findByIdAndUpdate(id, values);
};

/**
 * Deletes a post and its associated comments and likes by its ID.
 *
 * @param {string} id - The ID of the post to be deleted.
 * @returns {Promise<object|null>} - A promise that resolves to the deleted post object if found, or null if not found.
 */
export const delPost = async (id) => {
  // Delete associated comments and likes
  await CommentModel.deleteMany({ post_id: id });
  await LikeModel.deleteMany({ post_id: id });

  // Delete the post
  return PostsModel.findByIdAndDelete(id);
};

// Schema for creating comment
const commentSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  comment_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment_content: {
    type: String,
    required: true,
  },
  comment_timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const CommentModel = mongoose.model('Comment', commentSchema);

/**
 * Creates a new comment and increments the comment count of the associated post.
 *
 * @param {object} values - The values to create the new comment.
 * @returns {Promise<object>} - A promise that resolves to the created comment object.
 * @throws Will throw an error if there's an issue creating the comment.
 */
export const createNewComment = async (values) => {
  try {
    // Create new comment
    const newComment = await CommentModel(values).save();

    // Increment comment count of associated post
    await PostsModel.findByIdAndUpdate(values.post_id, {
      $inc: { post_comment_count: 1 },
    });

    return newComment;
  } catch (error) {
    // Log and rethrow error if there's an issue creating the comment
    console.error('Error creating comment:', error);
    throw error;
  }
};

/**
 * Deletes a comment and decrements the comment count of the associated post.
 *
 * @param {string} id - The ID of the comment to be deleted.
 * @returns {Promise<object|null>} - A promise that resolves to the deleted comment object if found, or null if not found.
 * @throws Will throw an error if there's an issue deleting the comment.
 */
export const delComment = async (id) => {
  try {
    // Find and delete the comment
    const deletedComment = await CommentModel.findOneAndDelete({ _id: id });

    // If a comment was deleted, decrement the comment count of the associated post
    if (deletedComment) {
      await PostsModel.findByIdAndUpdate(deletedComment.post_id, {
        $inc: { post_comment_count: -1 },
      });
    }

    return deletedComment;
  } catch (error) {
    // Log and rethrow error if there's an issue deleting the comment
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Retrieves a comment by its ID.
 *
 * @param {string} id - The ID of the comment to retrieve.
 * @returns {Promise<object|null>} - A promise that resolves to the comment object if found, or null if not found.
 */
export const getCommentById = async (id) => {
  return CommentModel.findById(id);
};

const itemsToFetch = 5;

export const getCommentsForPost = async (postId, page) => {
  return CommentModel.find({ post_id: postId })
    .skip((page - 1) * itemsToFetch)
    .limit(itemsToFetch);
};

// schema for creating like
const likeSchema = new mongoose.Schema({
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true,
  },
  like_owner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  like_timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const LikeModel = mongoose.model('Like', likeSchema);

/**
 * Creates a new like for a post and increments the like count of the associated post.
 *
 * @param {object} values - The values to create the new like.
 * @returns {Promise<number>} - A promise that resolves to a status code:
 *   - 201 if a new like is created successfully.
 *   - 200 if the user has already liked the post.
 */
export const createNewLike = async (values) => {
  const { post_id, like_owner_id } = values;
  const existingLike = await LikeModel.findOne({
    post_id,
    like_owner_id,
  });
  if (existingLike) {
    return 200; // already liked
  }
  const post = await PostsModel.findById(values.post_id);
  post.post_like_count += 1;
  await post.save();
  await LikeModel.create({
    post_id: values.post_id,
    like_owner_id: values.like_owner_id,
  });
  return 201; // new like created
};

/**
 * Deletes all posts, comments, and likes associated with a user by their ID.
 *
 * @param {string} id - The ID of the user whose posts, comments, and likes will be deleted.
 * @returns {Promise<void>} - A promise that resolves when all posts, comments, and likes are deleted successfully.
 * @throws Will throw an error if there's an issue deleting posts, comments, or likes.
 */
export const deleteAllPosts = async (id) => {
  try {
    await PostsModel.deleteMany({ post_owner_id: id });
    await CommentModel.deleteMany({ comment_owner_id: id });
    await LikeModel.deleteMany({ like_owner_id: id });
  } catch (error) {
    console.error('Error deleting posts and comments', error);
    throw error;
  }
};

/**
 * Retrieves likes for a post with pagination.
 *
 * @param {string} postId - The ID of the post for which to retrieve likes.
 * @param {number} page - The page number for pagination.
 * @returns {Promise<object[]>} - A promise that resolves to an array of like objects.
 */
export const getPostLikes = async (postId, page) => {
  return LikeModel.find({ post_id: postId })
    .skip((page - 1) * itemsToFetch)
    .limit(itemsToFetch);
};

/**
 * Retrieves a like by its ID.
 *
 * @param {string} id - The ID of the like to retrieve.
 * @returns {Promise<object|null>} - A promise that resolves to the like object if found, or null if not found.
 */
export const getLikeById = async (id) => {
  return LikeModel.findById(id);
};

/**
 * Deletes a like for a post and decrements the like count of the associated post.
 *
 * @param {object} values - The values to delete the like.
 * @returns {Promise<number>} - A promise that resolves to a status code:
 *   - 200 if the like is deleted successfully.
 *   - 404 if the like is not found.
 */
export const delLike = async (values) => {
  const { post_id, like_owner_id } = values;
  const existingLike = await LikeModel.findOne({
    post_id,
    like_owner_id,
  });
  if (!existingLike) {
    return 404; // like not found
  }
  const post = await PostsModel.findById(values.post_id);
  post.post_like_count -= 1;
  await post.save();
  await LikeModel.deleteOne({ _id: existingLike._id });
  return 200; // like deleted successfully
};
