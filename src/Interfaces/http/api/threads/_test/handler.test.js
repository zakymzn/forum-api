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
});
