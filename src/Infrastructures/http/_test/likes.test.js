const createServer = require('../createServer');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

let server;
const shouldRunLikesHttpTest = !!process.env.CI;
if (shouldRunLikesHttpTest) {
  beforeAll(async () => {
    server = await createServer(container);
  });

  afterAll(async () => {
    await pool.end();
  });
}

(shouldRunLikesHttpTest ? describe : describe.skip)('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
  let accessToken;
  let threadId;
  let commentId;

  beforeEach(async () => {
    // Add user
    const userResponse = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      },
    });

    const userId = JSON.parse(userResponse.payload).data.addedUser.id;

    // Login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret_password',
      },
    });
    accessToken = JSON.parse(loginResponse.payload).data.accessToken;

    // Add thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'sebuah thread',
        body: 'isi thread',
      },
    });
    threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    // Add comment
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'sebuah comment',
      },
    });
    commentId = JSON.parse(commentResponse.payload).data.addedComment.id;
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should response 200 and toggle like on comment', async () => {
    // initial like count should be 0
    let response = await server.inject({
      method: 'GET',
      url: `/threads/${threadId}`,
    });

    let responseJson = JSON.parse(response.payload);
    // the thread is returned under data.thread, and comments are nested there
    expect(responseJson.data.thread.comments).toHaveLength(1);
    expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);

    // put like (add)
    response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');

    // like count should be 1
    response = await server.inject({ method: 'GET', url: `/threads/${threadId}` });
    responseJson = JSON.parse(response.payload);
    expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);

    // put like again (remove)
    response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');

    // like count should be back to 0
    response = await server.inject({ method: 'GET', url: `/threads/${threadId}` });
    responseJson = JSON.parse(response.payload);
    expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);
  });

  it('should response 401 when request not authenticated', async () => {
    const response = await server.inject({
      method: 'PUT',
      url: `/threads/${threadId}/comments/${commentId}/likes`,
    });

    expect(response.statusCode).toEqual(401);
  });
});
