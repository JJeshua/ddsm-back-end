import { isAuthenticated } from '../middlewares/authentication.js';

import {
  createPost,
  createComment,
  createLike,
  archivePost,
  deleteComment,
  deletePost,
  deleteLike,
  updatePost,
  getPost,
  getCommsForPost,
  unarchivePost,
  getLikesForPost,
  getPostByUsername,
  getFeed,
} from '../controllers/posts.js';
import {
  postExists,
  isPostOwner,
  commentExists,
  isCommentOwner,
} from '../middlewares/posts.js';
import { userExistsByUsername } from '../middlewares/profile.js';

export default (router) => {
  router.post('/posts', isAuthenticated, createPost);
  router.post('/posts/:id/comment', isAuthenticated, postExists, createComment);
  router.put(
    '/posts/:id/archive',
    isAuthenticated,
    postExists,
    isPostOwner,
    archivePost
  );
  router.put(
    '/posts/:id/unarchive',
    isAuthenticated,
    postExists,
    isPostOwner,
    unarchivePost
  );
  router.delete(
    '/posts/:id/comment/:commentId',
    isAuthenticated,
    postExists,
    commentExists,
    isCommentOwner,
    deleteComment
  );
  router.delete(
    '/posts/:id/delete',
    isAuthenticated,
    postExists,
    isPostOwner,
    deletePost
  );
  router.put(
    '/posts/:id',
    isAuthenticated,
    postExists,
    isPostOwner,
    updatePost
  );
  router.get('/posts/:id', isAuthenticated, postExists, getPost);
  router.get('/posts/user/:username/:page', isAuthenticated, userExistsByUsername, getPostByUsername);
  router.get(
    '/posts/:id/:page/likes',
    isAuthenticated,
    postExists,
    getLikesForPost
  );
  router.get(
    '/posts/:id/:page/allComments',
    isAuthenticated,
    postExists,
    getCommsForPost
  );
  router.post('/posts/:id/like', isAuthenticated, postExists, createLike);
  router.delete('/posts/:id/delLike', isAuthenticated, postExists, deleteLike);
  router.get('/feed/:page', isAuthenticated, getFeed);
};
