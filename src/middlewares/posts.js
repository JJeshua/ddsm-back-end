import pkg from 'lodash';

import { getPostById, getCommentById, getLikeById } from '../db/posts.js';

const { get, merge } = pkg;
import { ObjectId } from 'mongodb';

export const postExists = async (req, res, next) => {
  try {
    const { id: post_id } = req.params;
    if (!ObjectId.isValid(post_id)) {
      return res.status(404).json({ error: 'Invalid post id' });
    }

    const post = await getPostById(post_id);
    if (!post) return res.status(404).json({ error: 'Post does not exist' });

    merge(req, { post_identity: post });
    next();
  } catch (error) {
    console.error(`(postExists) ${error}`);
    res.sendStatus(500);
  }
};

export const isPostOwner = (req, res, next) => {
  try {
    const post = get(req, 'post_identity');
    const user = get(req, 'identity');

    if (post.post_owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'User does not have access' });
    }

    next();
  } catch (error) {
    console.error(`(isPostOwner) ${error}`);
    return res.sendStatus(500);
  }
};

export const commentExists = async (req, res, next) => {
  try {
    const { commentId: comment_id } = req.params;
    if (!ObjectId.isValid(comment_id)) {
      return res.status(404).json({ error: 'Invalid comment id' });
    }

    const comment = await getCommentById(comment_id);
    if (!comment)
      return res.status(404).json({ error: 'Comment does not exist' });

    merge(req, { comment_identity: comment });
    next();
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const isCommentOwner = (req, res, next) => {
  try {
    const comment = get(req, 'comment_identity');
    const user = get(req, 'identity');

    if (comment.comment_owner_id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'User does not have access' });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export const likeExists = async (req, res, next) => {
  try {
    const { id: like_id } = req.params;
    const like = await getLikeById(like_id);

    if (!like) return res.status(404).json({ error: 'Like does not exist' });

    merge(req, { like });
    next();
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

export const isLikeOwner = (req, res, next) => {
  try {
    const { like } = req;
    const { user_id } = like;
    const { identity } = req;

    if (!like) return res.sendStatus(500);
    if (identity.id !== user_id)
      return res
        .status(403)
        .json({ error: 'You are not the owner of this like' });

    next();
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};
