const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const pool = require('../../database/postgres/pool');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'sebuah thread', body: 'isi thread', owner: 'user-123' });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist add comment and return added comment correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const addComment = new AddComment({
        content: 'sebuah comment',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(addComment);

      // Assert
      expect(addedComment.id).toBeDefined();
      expect(addedComment.content).toEqual(addComment.content);
      expect(addedComment.owner).toEqual(addComment.owner);

      const comments = await CommentsTableTestHelper.findCommentsById(addedComment.id);
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toEqual(addComment.content);
      expect(comments[0].owner).toEqual(addComment.owner);
      expect(comments[0].thread_id).toEqual(addComment.threadId);
    });
  });
});
