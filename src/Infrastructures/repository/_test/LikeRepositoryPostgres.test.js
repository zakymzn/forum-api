const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const LikeComment = require('../../../Domains/likes/entities/LikeComment');
const pool = require('../../database/postgres/pool');

const shouldRunLikePostgresTest = !!process.env.CI;
(shouldRunLikePostgresTest ? describe : describe.skip)('LikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'sebuah thread', body: 'isi thread', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'sebuah comment', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist add like and return inserted id', async () => {
      // Arrange
      const fakeIdGenerator = () => '123'; // stub
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);
      const likeComment = new LikeComment({ commentId: 'comment-123', owner: 'user-123' });

      // Action
      const added = await likeRepositoryPostgres.addLike(likeComment);

      // Assert
      expect(added.id).toBeDefined();
      const likes = await LikesTableTestHelper.findLikeById(added.id);
      expect(likes).toHaveLength(1);
      expect(likes[0].comment_id).toEqual('comment-123');
      expect(likes[0].owner).toEqual('user-123');
    });
  });

  describe('findLike function', () => {
    it('should return like when it exists', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const like = await likeRepositoryPostgres.findLike('comment-123', 'user-123');

      // Assert
      expect(like.id).toEqual('like-123');
    });

    it('should return undefined when like does not exist', async () => {
      // Arrange
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const like = await likeRepositoryPostgres.findLike('comment-123', 'user-unknown');

      // Assert
      expect(like).toBeUndefined();
    });
  });

  describe('deleteLike function', () => {
    it('should delete liked record', async () => {
      // Arrange
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const likes = await LikesTableTestHelper.findLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return 0 if no likes', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      expect(count).toEqual(0);
    });

    it('should return count correctly', async () => {
      // Arrange
      // ensure users exist to satisfy foreign key constraint
      await UsersTableTestHelper.addUser({ id: 'user-1', username: 'user1', password: 'secret', fullname: 'User One' });
      await UsersTableTestHelper.addUser({ id: 'user-2', username: 'user2', password: 'secret', fullname: 'User Two' });
      await LikesTableTestHelper.addLike({ id: 'like-001', commentId: 'comment-123', owner: 'user-1' });
      await LikesTableTestHelper.addLike({ id: 'like-002', commentId: 'comment-123', owner: 'user-2' });
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => '123');

      // Action
      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(count).toEqual(2);
    });
  });
});
