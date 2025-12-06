const AddThreadCommentUseCase = require('../AddThreadCommentUseCase');

describe('AddThreadCommentUseCase', () => {
  it('should orchestrating the add thread comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockResolvedValue({}),
    };

    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue({
        id: 'comment-123',
        content: useCasePayload.content,
        owner: useCasePayload.owner,
      }),
    };

    const addThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedComment = await addThreadCommentUseCase.execute(useCasePayload);

    // Assert
    expect(addedComment).toEqual({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    });
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(expect.objectContaining({
      content: useCasePayload.content,
      threadId: useCasePayload.threadId,
      owner: useCasePayload.owner,
    }));
  });

  it('should throw error when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah comment',
      threadId: 'thread-invalid',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      getThreadById: jest.fn().mockRejectedValue(new Error('THREAD_NOT_FOUND')),
    };

    const mockCommentRepository = {
      addComment: jest.fn(),
    };

    const addThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(addThreadCommentUseCase.execute(useCasePayload)).rejects.toThrowError('THREAD_NOT_FOUND');
    expect(mockCommentRepository.addComment).not.toBeCalled();
  });
});
