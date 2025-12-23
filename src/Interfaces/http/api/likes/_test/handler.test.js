const LikesHandler = require('../handler');

describe('LikesHandler unit tests', () => {
  const fakeContainer = {
    getInstance: jest.fn(),
  };

  beforeEach(() => {
    fakeContainer.getInstance.mockReset();
  });

  it('putLikeThreadCommentHandler should return 200 with success', async () => {
    const fakeLikeUseCase = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeLikeUseCase);

    const handler = new LikesHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123', commentId: 'comment-123' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.putLikeThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('putLikeThreadCommentHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeLikeUseCase = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeLikeUseCase);

    const handler = new LikesHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123', commentId: 'comment-123' }, auth: {} };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.putLikeThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeLikeUseCase.execute).toHaveBeenCalledWith({ threadId: 'thread-123', commentId: 'comment-123', owner: undefined });
  });

  it('putLikeThreadCommentHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeLikeUseCase = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeLikeUseCase);

    const handler = new LikesHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123', commentId: 'comment-123' } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.putLikeThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeLikeUseCase.execute).toHaveBeenCalledWith({ threadId: 'thread-123', commentId: 'comment-123', owner: undefined });
  });
});
