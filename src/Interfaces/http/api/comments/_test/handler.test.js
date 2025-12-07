const CommentsHandler = require('../handler');

describe('CommentsHandler unit tests', () => {
  const fakeContainer = {
    getInstance: jest.fn(),
  };

  beforeEach(() => {
    fakeContainer.getInstance.mockReset();
  });

  it('postThreadCommentHandler should return 201 with addedComment', async () => {
    const fakeAddComment = { execute: jest.fn().mockResolvedValue({ id: 'comment-1', content: 'c' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddComment);

    const handler = new CommentsHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123' }, payload: { content: 'c' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(response.body.data.addedComment).toBeDefined();
  });

  it('deleteThreadCommentHandler should return 200', async () => {
    const fakeDeleteComment = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteComment);

    const handler = new CommentsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('postThreadCommentHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeAddComment = { execute: jest.fn().mockResolvedValue({ id: 'comment-1', content: 'c' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddComment);

    const handler = new CommentsHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123' }, payload: { content: 'c' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddComment.execute).toHaveBeenCalledWith({ content: 'c', threadId: 'thread-123', owner: undefined });
  });

  it('deleteThreadCommentHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeDeleteComment = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteComment);

    const handler = new CommentsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteComment.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', owner: undefined });
  });

  it('deleteThreadCommentHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeDeleteComment = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteComment);

    const handler = new CommentsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteComment.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', owner: undefined });
  });
})