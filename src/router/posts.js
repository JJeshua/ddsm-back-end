import { isAuthenticated } from '../middlewares/authentication.js';

import { createPost, createComment } from '../controllers/posts.js';
import { postExists, isPostOwner } from '../middlewares/posts.js';

export default (router) => {
  router.post('/posts', isAuthenticated, createPost);
  router.post('/posts/:id/comment', isAuthenticated, createComment);
  router.put(
    '/posts/:id/archive',
    isAuthenticated,
    postExists,
    isPostOwner,
    archivePost
  );
};
