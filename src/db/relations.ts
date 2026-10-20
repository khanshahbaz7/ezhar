import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    posts: r.many.posts(),
    comments: r.many.comments(),
    postLikes: r.many.postLikes(),
    commentLikes: r.many.commentLikes(),

    // Rows where this user is the account being followed
    followers: r.many.follows({ alias: 'account' }),
    // Rows where this user is the one following someone
    following: r.many.follows({ alias: 'followedBy' }),

    receivedNotifications: r.many.notifications({ alias: 'receivedBy' }),
    createdNotifications: r.many.notifications({ alias: 'createdBy' }),
  },

  posts: {
    author: r.one.users({
      from: r.posts.authorId,
      to: r.users.id,
      optional: false,
    }),
    comments: r.many.comments(),
    likes: r.many.postLikes(),
    notifications: r.many.notifications(),
  },

  comments: {
    author: r.one.users({
      from: r.comments.authorId,
      to: r.users.id,
      optional: false,
    }),
    post: r.one.posts({
      from: r.comments.postId,
      to: r.posts.id,
      optional: false,
    }),
    likes: r.many.commentLikes(),
    notifications: r.many.notifications(),
  },

  postLikes: {
    author: r.one.users({
      from: r.postLikes.authorId,
      to: r.users.id,
      optional: false,
    }),
    post: r.one.posts({
      from: r.postLikes.postId,
      to: r.posts.id,
      optional: false,
    }),
  },

  commentLikes: {
    author: r.one.users({
      from: r.commentLikes.authorId,
      to: r.users.id,
      optional: false,
    }),
    comment: r.one.comments({
      from: r.commentLikes.commentId,
      to: r.comments.id,
      optional: false,
    }),
  },

  follows: {
    account: r.one.users({
      from: r.follows.accountId,
      to: r.users.id,
      alias: 'account',
      optional: false,
    }),
    followedBy: r.one.users({
      from: r.follows.followedById,
      to: r.users.id,
      alias: 'followedBy',
      optional: false,
    }),
  },

  notifications: {
    receivedBy: r.one.users({
      from: r.notifications.receivedById,
      to: r.users.id,
      alias: 'receivedBy',
      optional: false,
    }),
    createdBy: r.one.users({
      from: r.notifications.createdById,
      to: r.users.id,
      alias: 'createdBy',
      optional: false,
    }),
    post: r.one.posts({
      from: r.notifications.postId,
      to: r.posts.id,
    }),
    comment: r.one.comments({
      from: r.notifications.commentId,
      to: r.comments.id,
    }),
  },
}));