const AddComment = require('../../Domains/comments/entities/AddComment');

class AddThreadCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    // ensure thread exists
    await this._threadRepository.getThreadById(threadId);

    const addComment = new AddComment(useCasePayload);

    return this._commentRepository.addComment(addComment);
  }
}

module.exports = AddThreadCommentUseCase;
