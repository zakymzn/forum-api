const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.putLikeThreadCommentHandler = this.putLikeThreadCommentHandler.bind(this);
  }

  async putLikeThreadCommentHandler(request, h) {
    const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
    const { threadId, commentId } = request.params;
    const owner = request.auth && request.auth.credentials ? request.auth.credentials.id : undefined;

    await likeCommentUseCase.execute({ threadId, commentId, owner });

    const response = h.response({
      status: 'success',
    });
    response.code(200);
    return response;
  }
}

module.exports = LikesHandler;