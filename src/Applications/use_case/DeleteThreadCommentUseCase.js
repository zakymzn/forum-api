const DeleteComment = require('../../Domains/comments/entities/DeleteComment');

class DeleteThreadCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const deleteComment = new DeleteComment(useCasePayload);

    const { threadId, commentId, owner } = deleteComment;

    // verify thread exists
    await this._threadRepository.getThreadById(threadId);

    // verify comment ownership and existence
    await this._commentRepository.verifyCommentOwner(commentId, owner);

    // perform soft delete
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteThreadCommentUseCase;
