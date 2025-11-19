const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadByIdHandler = this.getThreadByIdHandler.bind(this);
    this.postThreadCommentHandler = this.postThreadCommentHandler.bind(this);
    this.deleteThreadCommentHandler = this.deleteThreadCommentHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    // owner is obtained from the access token (authentication credentials)
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;
    const addedThread = await addThreadUseCase.execute({ ...request.payload, owner });

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      }
    });
    response.code(201);
    return response;
  }

  async getThreadByIdHandler(request, h) {
    const getThreadUseCase = this._container.getInstance(GetThreadUseCase.name);

  }

  async postThreadCommentHandler(request, h) {
    const postThreadCommentUseCase = this._container.getInstance(AddThreadCommentUseCase.name);
  }

  async deleteThreadCommentHandler(reqeust, h) {
    const deleteThreadCommentUseCase = this._container.getInstance(DeleteThreadCommentUseCase.name);
  }
}

module.exports = ThreadsHandler;