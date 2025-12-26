class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute({ threadId, commentId, owner }) {
    // ensure thread and comment exist
    await this._threadRepository.getThreadById(threadId);
    await this._commentRepository.verifyCommentExist(commentId);

    const existing = await this._likeRepository.findLike(commentId, owner);

    if (existing) {
      await this._likeRepository.deleteLike(commentId, owner);
    } else {
      await this._likeRepository.addLike({ commentId, owner });
    }
  }
}

module.exports = LikeCommentUseCase;
