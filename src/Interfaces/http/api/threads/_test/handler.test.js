const ThreadsHandler = require('../handler');

describe('ThreadsHandler unit tests', () => {
  const fakeContainer = {
    getInstance: jest.fn(),
  };

  beforeEach(() => {
    fakeContainer.getInstance.mockReset();
  });

  it('postThreadHandler should return 201 with addedThread', async () => {
    const fakeAddThreadUseCase = { execute: jest.fn().mockResolvedValue({ id: 'thread-123', title: 't', owner: 'user-1' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddThreadUseCase);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { payload: { title: 't', body: 'b' }, auth: { credentials: { id: 'user-1' } } };

    const h = {
      response: (body) => {
        const res = { body };
        res.code = (status) => {
          res.statusCode = status;
          return res;
        };
        return res;
      },
    };

    const response = await handler.postThreadHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(response.body.data.addedThread).toBeDefined();
  });

  it('getThreadByIdHandler should return 200 with thread', async () => {
    const fakeGetThreadUseCase = { execute: jest.fn().mockResolvedValue({ id: 'thread-123', title: 't' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeGetThreadUseCase);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123' } };
    const h = {
      response: (body) => {
        const res = { body };
        res.code = (status) => {
          res.statusCode = status;
          return res;
        };
        return res;
      },
    };

    const response = await handler.getThreadByIdHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.thread).toBeDefined();
  });

  it('postThreadCommentHandler should return 201 with addedComment', async () => {
    const fakeAddComment = { execute: jest.fn().mockResolvedValue({ id: 'comment-1', content: 'c' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddComment);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123' }, payload: { content: 'c' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(response.body.data.addedComment).toBeDefined();
  });

  it('deleteThreadCommentHandler should return 200', async () => {
    const fakeDeleteComment = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteComment);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('postThreadCommentReplyHandler should return 201 with addedReply', async () => {
    const fakeAddReply = { execute: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'r' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddReply);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, payload: { content: 'r' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(response.body.data.addedReply).toBeDefined();
  });

  it('deleteThreadCommentReplyHandler should return 200', async () => {
    const fakeDeleteReply = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteReply);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c', replyId: 'r' }, auth: { credentials: { id: 'user-1' } } };
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('postThreadHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeAddThreadUseCase = { execute: jest.fn().mockResolvedValue({ id: 'thread-123', title: 't' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddThreadUseCase);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { payload: { title: 't', body: 'b' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddThreadUseCase.execute).toHaveBeenCalledWith({ title: 't', body: 'b', owner: undefined });
  });

  it('postThreadCommentHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeAddComment = { execute: jest.fn().mockResolvedValue({ id: 'comment-1', content: 'c' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddComment);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 'thread-123' }, payload: { content: 'c' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddComment.execute).toHaveBeenCalledWith({ content: 'c', threadId: 'thread-123', owner: undefined });
  });

  it('postThreadCommentReplyHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeAddReply = { execute: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'r' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddReply);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, payload: { content: 'r' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddReply.execute).toHaveBeenCalledWith({ content: 'r', commentId: 'c', threadId: 't', owner: undefined });
  });

  it('postThreadCommentReplyHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeAddReply = { execute: jest.fn().mockResolvedValue({ id: 'reply-1', content: 'r' }) };
    fakeContainer.getInstance.mockReturnValueOnce(fakeAddReply);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, payload: { content: 'r' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.postThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(201);
    expect(fakeAddReply.execute).toHaveBeenCalledWith({ content: 'r', commentId: 'c', threadId: 't', owner: undefined });
  });

  it('deleteThreadCommentReplyHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeDeleteReply = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteReply);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c', replyId: 'r' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteReply.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', replyId: 'r', owner: undefined });
  });

  it('deleteThreadCommentReplyHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeDeleteReply = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteReply);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c', replyId: 'r' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentReplyHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteReply.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', replyId: 'r', owner: undefined });
  });

  it('deleteThreadCommentHandler should use undefined owner when request.auth is undefined', async () => {
    const fakeDeleteComment = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteComment);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' } }; // no auth
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteComment.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', owner: undefined });
  });

  it('deleteThreadCommentHandler should use undefined owner when request.auth.credentials is undefined', async () => {
    const fakeDeleteComment = { execute: jest.fn().mockResolvedValue() };
    fakeContainer.getInstance.mockReturnValueOnce(fakeDeleteComment);

    const handler = new ThreadsHandler(fakeContainer);
    const request = { params: { threadId: 't', commentId: 'c' }, auth: {} }; // no credentials
    const h = { response: (body) => { const res = { body }; res.code = (status) => { res.statusCode = status; return res; }; return res; } };

    const response = await handler.deleteThreadCommentHandler(request, h);
    expect(response.statusCode).toBe(200);
    expect(fakeDeleteComment.execute).toHaveBeenCalledWith({ threadId: 't', commentId: 'c', owner: undefined });
  });
});
