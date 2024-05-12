import pkg from 'lodash';

import { getPostById, getCommentById, getLikeById } from '../db/posts.js';

const { get, merge } = pkg;
import { ObjectId } from 'mongodb';

/**
 * Middleware to check if a post exists.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const postExists = async (req, res, next) => {
  try {
    // Extract post ID from request parameters
    const { id: post_id } = req.params;

    // Check if the post ID is a valid ObjectId
    if (!ObjectId.isValid(post_id)) {
      // If the post ID is invalid, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'Invalid post id' });
    }

    // Retrieve the post by ID
    const post = await getPostById(post_id);

    // Check if the post exists
    if (!post) {
      // If the post does not exist, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'Post does not exist' });
    }

    // Merge post identity into request object
    merge(req, { post_identity: post });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during post existence check, log the error and send a 500 Internal Server Error response
    console.error(`(postExists) ${error}`);
    res.sendStatus(500);
  }
};

/**
 * Middleware to check if the authenticated user is the owner of the post.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const isPostOwner = (req, res, next) => {
  try {
    // Extract post and user identities from request
    const post = get(req, 'post_identity');
    const user = get(req, 'identity');

    // Check if the authenticated user is the owner of the post
    if (post.post_owner_id.toString() !== user._id.toString()) {
      // If the user is not the owner of the post, send a 403 Forbidden response with an error message
      return res.status(403).json({ error: 'User does not have access' });
    }

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during ownership check, log the error and send a 500 Internal Server Error response
    console.error(`(isPostOwner) ${error}`);
    return res.sendStatus(500);
  }
};

/**
 * Middleware to check if a comment exists.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const commentExists = async (req, res, next) => {
  try {
    // Extract comment ID from request parameters
    const { commentId: comment_id } = req.params;

    // Check if the comment ID is a valid ObjectId
    if (!ObjectId.isValid(comment_id)) {
      // If the comment ID is invalid, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'Invalid comment id' });
    }

    // Retrieve the comment by ID
    const comment = await getCommentById(comment_id);

    // Check if the comment exists
    if (!comment) {
      // If the comment does not exist, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'Comment does not exist' });
    }

    // Merge comment identity into request object
    merge(req, { comment_identity: comment });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during comment existence check, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Middleware to check if the authenticated user is the owner of the comment.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const isCommentOwner = (req, res, next) => {
  try {
    // Extract comment and user identities from request
    const comment = get(req, 'comment_identity');
    const user = get(req, 'identity');

    // Check if the authenticated user is the owner of the comment
    if (comment.comment_owner_id.toString() !== user._id.toString()) {
      // If the user is not the owner of the comment, send a 403 Forbidden response with an error message
      return res.status(403).json({ error: 'User does not have access' });
    }

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during ownership check, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.sendStatus(500);
  }
};

/**
 * Middleware to check if a like exists.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const likeExists = async (req, res, next) => {
  try {
    // Extract like ID from request parameters
    const { id: like_id } = req.params;

    // Retrieve the like by ID
    const like = await getLikeById(like_id);

    // Check if the like exists
    if (!like) {
      // If the like does not exist, send a 404 Not Found response with an error message
      return res.status(404).json({ error: 'Like does not exist' });
    }

    // Merge like object into request object
    merge(req, { like });

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during like existence check, log the error and send a 500 Internal Server Error response
    console.error(error);
    res.sendStatus(500);
  }
};

/**
 * Middleware to check if the authenticated user is the owner of the like.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next function to call in the middleware chain.
 * @returns {void} - Returns void.
 */
export const isLikeOwner = (req, res, next) => {
  try {
    // Extract like and user identities from request
    const { like } = req;
    const { user_id } = like;
    const { identity } = req;

    // Check if the like exists
    if (!like) {
      // If the like does not exist, send a 500 Internal Server Error response
      return res.sendStatus(500);
    }

    // Check if the authenticated user is the owner of the like
    if (identity.id !== user_id) {
      // If the user is not the owner of the like, send a 403 Forbidden response with an error message
      return res
        .status(403)
        .json({ error: 'You are not the owner of this like' });
    }

    // Proceed to the next middleware in the chain
    next();
  } catch (error) {
    // If an error occurs during ownership check, log the error and send a 500 Internal Server Error response
    console.error(error);
    return res.sendStatus(500);
  }
};
