const AddThreadCommentReplyUseCase = require('../AddThreadCommentReplyUseCase');

describe('AddThreadCommentReplyUseCase', () => {
  it('should orchestrating the add thread comment reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah reply',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({}),
    };

    const mockCommentRepository = {
      verifyCommentExist: jest.fn().mockResolvedValue({}),
    };

    const mockReplyRepository = {
      addReply: jest.fn().mockResolvedValue({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    };

    const addThreadCommentReplyUseCase = new AddThreadCommentReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addThreadCommentReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toEqual({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockReplyRepository.addReply).toBeCalledWith(expect.objectContaining({
      content: useCasePayload.content,
      commentId: useCasePayload.commentId,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });

  it('should throw error when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah reply',
      commentId: 'comment-123',
      threadId: 'thread-invalid',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new Error('THREAD_NOT_FOUND')),
    };

    const mockCommentRepository = {
      verifyCommentExist: jest.fn(),
    };

    const mockReplyRepository = {
      addReply: jest.fn(),
    };

    const addThreadCommentReplyUseCase = new AddThreadCommentReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(addThreadCommentReplyUseCase.execute(useCasePayload)).rejects.toThrowError('THREAD_NOT_FOUND');
    expect(mockCommentRepository.verifyCommentExist).not.toBeCalled();
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });

  it('should throw error when comment not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah reply',
      commentId: 'comment-invalid',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({}),
    };

    const mockCommentRepository = {
      verifyCommentExist: jest.fn().mockRejectedValue(new Error('COMMENT_NOT_FOUND')),
    };

    const mockReplyRepository = {
      addReply: jest.fn(),
    };

    const addThreadCommentReplyUseCase = new AddThreadCommentReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(addThreadCommentReplyUseCase.execute(useCasePayload)).rejects.toThrowError('COMMENT_NOT_FOUND');
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});
