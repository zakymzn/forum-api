const AddComment = require('../AddComment');

describe('AddComment entity', () => {
  it('should create AddComment object correctly', () => {
    const payload = {
      content: 'sebuah comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const addComment = new AddComment(payload);

    expect(addComment.content).toEqual(payload.content);
    expect(addComment.threadId).toEqual(payload.threadId);
    expect(addComment.owner).toEqual(payload.owner);
  });

  it('should throw error when payload not contain needed property', () => {
    const payload = {
      threadId: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: 'thread-123',
      owner: 'user-123',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});
