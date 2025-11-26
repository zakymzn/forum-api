const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(addComment) {
    const { content, threadId, owner } = addComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments (id, content, thread_id, owner) VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      const error = new Error('COMMENT_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }

    const comment = result.rows[0];
    if (comment.owner !== owner) {
      const error = new Error('NOT_OWNER');
      error.statusCode = 403;
      throw error;
    }
  }

  async verifyCommentExist(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      const error = new Error('COMMENT_NOT_FOUND');
      error.statusCode = 404;
      throw error;
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = true WHERE id = $1',
      values: [commentId],
    };

    await this._pool.query(query);
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.content, comments.is_delete, comments.created_at, users.username
             FROM comments
             LEFT JOIN users ON users.id = comments.owner
             WHERE comments.thread_id = $1
             ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.created_at,
      content: row.is_delete ? '**komentar telah dihapus**' : row.content,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
