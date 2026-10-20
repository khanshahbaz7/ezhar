import {
  boolean,
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';



const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).notNull().defaultNow();

const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

/* -------------------------------------------------------------------------- */
/*  Enums                                                                     */
/* -------------------------------------------------------------------------- */




export const notificationTypeEnum = pgEnum('notification_type', [
  'LIKE',
  'COMMENT',
  'FOLLOW',
]);

/* -------------------------------------------------------------------------- */
/*  Tables                                                                    */
/* -------------------------------------------------------------------------- */

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  name: text('name'),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  avatarUrl: text('avatar_url'),
  coverUrl: text('cover_url'),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const posts = pgTable(
  'posts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    image: text('image'),
    imageFileId: text("image_file_id"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('posts_author_id_idx').on(t.authorId)],
);

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index('comments_author_id_post_id_idx').on(t.authorId, t.postId)],
);

export const postLikes = pgTable(
  'post_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [
    // The unique constraint creates an index on (author_id, post_id) already,
    // so the separate @@index from Prisma is no longer needed.
    unique('post_likes_author_id_post_id_unique').on(t.authorId, t.postId),
    // Helps "count likes for a post" queries.
    index('post_likes_post_id_idx').on(t.postId),
  ],
);

export const commentLikes = pgTable(
  'comment_likes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id')
      .notNull()
      .references(() => comments.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [
    unique('comment_likes_author_id_comment_id_unique').on(
      t.authorId,
      t.commentId,
    ),
    index('comment_likes_comment_id_idx').on(t.commentId),
  ],
);

export const follows = pgTable(
  'follows',
  {
    // The user being followed
    accountId: uuid('account_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // The user who follows
    followedById: uuid('followed_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => [
    // The composite PK already indexes (account_id, followed_by_id).
    primaryKey({ columns: [t.accountId, t.followedById] }),
    // Helps "who does this user follow" lookups.
    index('follows_followed_by_id_idx').on(t.followedById),
  ],
);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    receivedById: uuid('received_by_id')
      .notNull()
      .references(() => users.id),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id),
    type: notificationTypeEnum('type').notNull(),
    read: boolean('read').notNull(),
    postId: uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
    commentId: uuid('comment_id').references(() => comments.id, {
      onDelete: 'cascade',
    }),
    createdAt: createdAt(),
  },
  (t) => [
    index('notifications_received_by_id_created_at_idx').on(
      t.receivedById,
      t.createdAt,
    ),
  ],
);

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                            */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type PostLike = typeof postLikes.$inferSelect;
export type CommentLike = typeof commentLikes.$inferSelect;
export type Follow = typeof follows.$inferSelect;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;


