const RepliesHandler = require('../handler');

describe('RepliesHandler unit tests', () => {
  const fakeContainer = {
    getInstance: jest.fn(),
  };

  beforeEach(() => {
    fakeContainer.getInstance.mockReset();
  });

  it('postThreadCommentReplyHandler should return 201 with addedReply', async () => {
    const fakeAddReply = { execute: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'r' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddReply);

    const handler = new RepliesHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, payload: { content: 'r' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(response.body.data.addedReply).toBeDefined();
  });

  it('deleteThreadCommentReplyHandler should return 200', async () => {
    const fakeDeleteReply = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteReply);

    const handler = new RepliesHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c', replyId: 'r' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('postThreadCommentReplyHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeAddReply = { execute: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'r' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddReply);

    const handler = new RepliesHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, payload: { content: 'r' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddReply.execute).toHaveBeenCalledWith({ content: 'r', commentId: 'c', threadId: 't', owner: undefined });
  });

  it('postThreadCommentReplyHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeAddReply = { execute: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'r' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddReply);

    const handler = new RepliesHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, payload: { content: 'r' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddReply.execute).toHaveBeenCalledWith({ content: 'r', commentId: 'c', threadId: 't', owner: undefined });
  });

  it('deleteThreadCommentReplyHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeDeleteReply = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteReply);

    const handler = new RepliesHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c', replyId: 'r' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteReply.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', replyId: 'r', owner: undefined });
  });

  it('deleteThreadCommentReplyHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeDeleteReply = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteReply);

    const handler = new RepliesHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c', replyId: 'r' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteReply.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', replyId: 'r', owner: undefined });
  });
})