/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('replies', {
    id: { type: 'VARCHAR(60)', primaryKey: true },
    content: { type: 'TEXT', notNull: true },
    comment_id: {
      type: 'VARCHAR(60)',
      notNull: true,
      references: '"comments"',
      onDelete: 'cascade',
    },
    thread_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"threads"',
      onDelete: 'cascade',
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    created_at: { type: 'TIMESTAMP', notNull: true, default: pgm.func('CURRENT_TIMESTAMP') },
    is_delete: { type: 'BOOLEAN', notNull: true, default: false },
  });
};

exports.down = pgm => {
  pgm.dropTable('replies');
};
