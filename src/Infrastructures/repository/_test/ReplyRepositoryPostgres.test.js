const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const pool = require('../../database/postgres/pool');

describe('ReplyRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', title: 'sebuah thread', body: 'isi thread', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', content: 'sebuah comment', threadId: 'thread-123', owner: 'user-123' });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist add reply and return added reply correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const addReply = new AddReply({
        content: 'sebuah reply',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      // Assert
      expect(addedReply.id).toBeDefined();
      expect(addedReply.content).toEqual(addReply.content);
      expect(addedReply.owner).toEqual(addReply.owner);

      const replies = await RepliesTableTestHelper.findRepliesById(addedReply.id);
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toEqual(addReply.content);
      expect(replies[0].owner).toEqual(addReply.owner);
      expect(replies[0].comment_id).toEqual(addReply.commentId);
      expect(replies[0].thread_id).toEqual(addReply.threadId);
    });
  });

  describe('getReplyByCommentId function', () => {
    it('should get replies by comment id correctly', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const addReply = new AddReply({
        content: 'sebuah reply',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      await replyRepositoryPostgres.addReply(addReply);

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toBeDefined();
      expect(replies[0].content).toEqual(addReply.content);
      expect(replies[0].username).toEqual('dicoding');
      expect(replies[0].date).toBeDefined();
    });

    it('should return empty array if comment has no replies', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

      // Assert
      expect(replies).toEqual([]);
    });

    it('should replace deleted reply content with replacement text', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
      const addReply = new AddReply({
        content: 'sebuah reply',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      });
      const addedReply = await replyRepositoryPostgres.addReply(addReply);

      await pool.query('UPDATE replies SET is_delete = true WHERE id = $1', [addedReply.id]);

      // Action
      const replies = await replyRepositoryPostgres.getReplyByCommentId('comment-123');

      // Assert
      expect(replies).toHaveLength(1);
      expect(replies[0].content).toEqual('**balasan telah dihapus**');
    });
  });
});
