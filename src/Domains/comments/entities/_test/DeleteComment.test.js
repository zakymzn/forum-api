const DeleteComment = require('../DeleteComment');

describe('DeleteComment entity', () => {
  it('should create DeleteComment object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const deleteComment = new DeleteComment(payload);

    expect(deleteComment.threadId).toEqual(payload.threadId);
    expect(deleteComment.commentId).toEqual(payload.commentId);
    expect(deleteComment.owner).toEqual(payload.owner);
  });

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      threadId: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      threadId: 123,
      commentId: 'comment-123',
      owner: 'user-123',
    };

    expect(() => new DeleteComment(payload)).toThrowError('DELETE_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
