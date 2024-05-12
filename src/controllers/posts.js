import {
  createNewPost,
  createNewComment,
  createNewLike,
  delComment,
  delPost,
  delLike,
  archivePost as _archivePost,
  getCommentsForPost,
  unarchivePost as _unarchivePost,
  postUpdate,
  getPostLikes,
  getPostsByUserId,
} from '../db/posts.js';
import { getReactionAndUserData } from '../db/users.js';
import pkg from 'lodash';
const { get } = pkg;

/**
 * Creates a new post for the authenticated user.
 *
 * @param {Object} req - The request object containing post content.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const createPost = async (req, res) => {
  // Extract post content from the request body
  const { post_content } = req.body;

  // Check if post content is missing
  if (!post_content) {
    // If post content is missing, send a 400 Bad Request response
    return res.status(400).json({ error: 'post_content required.' });
  }

  // Extract authenticated user from the request
  const user = get(req, 'identity');

  try {
    // Create a new post with the provided content and owner ID
    const newPost = await createNewPost({
      post_owner_id: user._id.toString(),
      post_content,
    });

    // Send a 201 Created response with the ID of the newly created post
    return res.status(201).json(newPost._id);
  } catch (error) {
    // If an error occurs during post creation, log the error and send a 400 Bad Request response
    console.error('error creating post:', error);
    return res.status(400).json({ error: 'Invalid request...' });
  }
};

/**
 * Archives a post.
 *
 * @param {Object} req - The request object containing post identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const archivePost = async (req, res) => {
  try {
    // Extract post identity from the request
    const post = get(req, 'post_identity');

    // Archive the post
    await _archivePost(post);

    // Send a 200 OK response indicating successful archiving
    res.sendStatus(200);
  } catch (error) {
    // If an error occurs during archiving, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Unarchives a post.
 *
 * @param {Object} req - The request object containing post identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const unarchivePost = async (req, res) => {
  try {
    // Extract post identity from the request
    const post = get(req, 'post_identity');

    // Unarchive the post
    await _unarchivePost(post);

    // Send a 200 OK response indicating successful unarchiving
    res.sendStatus(200);
  } catch (error) {
    // If an error occurs during archiving, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Creates a new comment on a post.
 *
 * @param {Object} req - The request object containing comment content, post identity, and user identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const createComment = async (req, res) => {
  // Extract comment content from the request body
  const { comment_content } = req.body;

  // Extract post id from the request's post identity
  const { id: post_id } = get(req, 'post_identity');

  // Extract authenticated user from the request
  const user = get(req, 'identity');

  try {
    // Check if the comment content is provided
    if (!comment_content) {
      // If comment content is missing, send a 400 Bad Request response
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Create a new comment with the provided content, post id, and owner ID
    const newComment = await createNewComment({
      post_id,
      comment_owner_id: user._id.toString(),
      comment_content,
    });

    // Send a 201 Created response with the ID of the newly created comment
    return res.status(201).json(newComment._id);
  } catch (error) {
    // If an error occurs during comment creation, log the error and send a 400 Bad Request response
    console.error('error creating comment:', error);
    return res.status(400).json({ error: 'Invalid request...' });
  }
};

/**
 * Deletes a comment.
 *
 * @param {Object} req - The request object containing comment identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const deleteComment = async (req, res) => {
  try {
    // Extract comment identity from the request
    const comment = get(req, 'comment_identity');

    // Delete the comment
    await delComment(comment._id);

    // Send a 200 OK response indicating successful deletion
    return res.sendStatus(200);
  } catch {
    // If an error occurs during deletion, send a 500 Internal Server Error response
    res.sendStatus(500);
  }
};

/**
 * Deletes a post.
 *
 * @param {Object} req - The request object containing post ID.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const deletePost = async (req, res) => {
  try {
    // Extract post ID from the request parameters
    const { id: post_id } = req.params;

    // Delete the post
    await delPost(post_id);

    // Send a 200 OK response with a success message
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    // If an error occurs during deletion, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Updates a post.
 *
 * @param {Object} req - The request object containing post content and identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status.
 */
export const updatePost = async (req, res) => {
  try {
    // Extract post content from the request body
    const { post_content } = req.body;

    // Check if post content is provided
    if (!post_content) {
      // If post content is missing, send a 400 Bad Request response
      return res.status(400).json({ error: 'No post content provided' });
    }

    // Extract post identity from the request
    const post = get(req, 'post_identity');

    // Update the post with the new content
    postUpdate(post._id, {
      post_content,
    });

    // Send a 200 OK response with a success message
    return res.status(200).json({ message: 'Post updated successfully' });
  } catch (error) {
    // If an error occurs during updating, log the error and send a 500 Internal Server Error response
    console.error('Error updating post: ', error);
    return res.sendStatus(500);
  }
};

/**
 * Retrieves a post.
 *
 * @param {Object} req - The request object containing post identity data.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and the retrieved post.
 */
export const getPost = async (req, res) => {
  try {
    // Extract post identity from the request
    const { post_identity } = req;

    // Send a 200 OK response with the retrieved post
    return res.status(200).json(post_identity);
  } catch (error) {
    // If an error occurs during retrieval, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves posts by username.
 *
 * @param {Object} req - The request object containing requested user identity data and page number.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and the retrieved posts.
 */
export const getPostByUsername = async (req, res) => {
  try {
    // Extract requested user identity from the request
    const requested_user = get(req, 'requested_user_identity');

    // Extract page number from the request parameters and convert it to a number
    const page = Number(req.params.page);

    // Check if the page number is a positive integer
    if (!Number.isInteger(page) || page <= 0) {
      // If page number is invalid, send a 400 Bad Request response
      return res.status(400).json({
        error: 'Page number must be an integer greater than or equal to 1.',
      });
    }

    // Retrieve posts by user ID and page number
    const posts = await getPostsByUserId(requested_user._id, page);

    // Send a 200 OK response with the retrieved posts
    return res.status(200).json(posts);
  } catch (error) {
    // If an error occurs during retrieval, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves likes for a post.
 *
 * @param {Object} req - The request object containing post ID and page number.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and the retrieved likes.
 */
export const getLikesForPost = async (req, res) => {
  try {
    // Extract post ID from the request parameters
    const post_id = req.params.id;

    // Extract page number from the request parameters and convert it to a number
    const page = Number(req.params.page);

    // Check if the page number is a positive integer
    if (!Number.isInteger(page) || page <= 0) {
      // If page number is invalid, send a 400 Bad Request response
      return res.status(400).json({
        error: 'Page number must be an integer greater than or equal to 1.',
      });
    }

    // Retrieve likes for the post based on post ID and page number
    const likes = await getPostLikes(post_id, page);

    // Retrieve user IDs who reacted with likes
    const userIds = await getReactionAndUserData({
      type: 'likes',
      content: likes,
    });

    // Send a 200 OK response with the retrieved user IDs
    return res.status(200).json(userIds);
  } catch (error) {
    // If an error occurs during retrieval, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Retrieves comments for a post.
 *
 * @param {Object} req - The request object containing post ID and page number.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and the retrieved comments.
 */
export const getCommsForPost = async (req, res) => {
  try {
    // Extract post ID from the request parameters
    const post_id = req.params.id;

    // Extract page number from the request parameters and convert it to a number
    const page = Number(req.params.page);

    // Check if the page number is a positive integer
    if (!Number.isInteger(page) || page <= 0) {
      // If page number is invalid, send a 400 Bad Request response
      return res.status(400).json({
        error: 'Page number must be an integer greater than or equal to 1.',
      });
    }

    // Retrieve comments for the post based on post ID and page number
    const comments = await getCommentsForPost(post_id, page);

    // Retrieve user IDs who commented
    const userIds = await getReactionAndUserData({
      type: 'comments',
      content: comments,
    });

    // Send a 200 OK response with the retrieved user IDs
    return res.status(200).json(userIds);
  } catch (error) {
    // If an error occurs during retrieval, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Creates a new like for a post.
 *
 * @param {Object} req - The request object containing post ID.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and message.
 */
export const createLike = async (req, res) => {
  // Extract post ID from the request parameters
  const { id: post_id } = req.params;

  // Extract authenticated user from the request
  const user = get(req, 'identity');

  try {
    // Attempt to create a new like for the post
    const statusCode = await createNewLike({
      post_id,
      like_owner_id: user._id.toString(),
    });

    // Determine the appropriate response based on the status code returned
    if (statusCode === 201) {
      // If a new like is created, send a 201 Created response with a success message
      res.status(201).json({ message: 'New like created successfully' });
    } else {
      // If the user has already liked the post, send a 200 OK response with a message indicating so
      res.status(200).json({ message: 'You have already liked this post.' });
    }
  } catch (error) {
    // If an error occurs during like creation, log the error and send a 400 Bad Request response
    console.error('Error creating like:', error);
    res.status(400).json({
      error: 'Invalid request...',
    });
  }
};

/**
 * Deletes a like for a post.
 *
 * @param {Object} req - The request object containing post ID.
 * @param {Object} res - The response object.
 * @returns {Promise} - A promise that resolves with a response status and message.
 */
export const deleteLike = async (req, res) => {
  // Extract post ID from the request parameters
  const { id: post_id } = req.params;

  // Extract authenticated user from the request
  const user = get(req, 'identity');

  try {
    // Attempt to delete the like for the post
    const statusCode = await delLike({
      post_id,
      like_owner_id: user._id.toString(),
    });

    // Determine the appropriate response based on the status code returned
    if (statusCode === 200) {
      // If the like is deleted successfully, send a 200 OK response with a success message
      res.status(200).json({ message: 'Like deleted successfully' });
    } else {
      // If the like is not found, send a 404 Not Found response with a message indicating so
      res.status(404).json({ message: 'Like not found.' });
    }
  } catch (error) {
    // If an error occurs during like deletion, log the error and send a 400 Bad Request response
    console.error('Error deleting like:', error);
    res.status(400).json({
      error: 'Invalid request...',
    });
  }
};
