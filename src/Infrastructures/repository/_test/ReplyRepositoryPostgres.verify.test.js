const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const pool = require('../../database/postgres/pool');

describe('ReplyRepositoryPostgres additional behaviors', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret', fullname: 'Dicoding Indonesia' });
    await UsersTableTestHelper.addUser({ id: 'user-999', username: 'other', password: 'secret', fullname: 'Other User' });
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

  it('should throw REPLY_NOT_FOUND when verifyReplyOwner called with invalid id', async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

    // Action & Assert
    await expect(replyRepositoryPostgres.verifyReplyOwner('reply-invalid', 'user-123')).rejects.toThrowError('REPLY_NOT_FOUND');
  });

  it('should throw NOT_OWNER when verifyReplyOwner called by not owner', async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
    await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'sebuah balasan', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

    // Action & Assert
    await expect(replyRepositoryPostgres.verifyReplyOwner('reply-123', 'user-999')).rejects.toThrowError('NOT_OWNER');
  });

  it('should delete reply (soft delete) correctly', async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');
    await RepliesTableTestHelper.addReply({ id: 'reply-123', content: 'sebuah balasan', commentId: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

    // Action
    await replyRepositoryPostgres.deleteReply('reply-123');

    // Assert
    const replies = await RepliesTableTestHelper.findRepliesById('reply-123');
    expect(replies).toHaveLength(1);
    expect(replies[0].is_delete).toBe(true);
  });

  it('should verify reply exist and throw when not found', async () => {
    // Arrange
    const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, () => '123');

    // Action & Assert
    await expect(replyRepositoryPostgres.verifyReplyExist('reply-invalid')).rejects.toThrowError('REPLY_NOT_FOUND');
  });
});
