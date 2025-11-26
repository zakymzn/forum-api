const AddReply = require('../AddReply');

describe('AddReply entity', () => {
  it('should create AddReply object correctly', () => {
    const payload = {
      content: 'sebuah reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const addReply = new AddReply(payload);

    expect(addReply.content).toEqual(payload.content);
    expect(addReply.commentId).toEqual(payload.commentId);
    expect(addReply.threadId).toEqual(payload.threadId);
    expect(addReply.owner).toEqual(payload.owner);
  });

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      content: 123,
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
