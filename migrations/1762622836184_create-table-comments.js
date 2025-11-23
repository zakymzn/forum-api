/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('comments', {
    id: { type: 'VARCHAR(60)', primaryKey: true },
    content: { type: 'TEXT', notNull: true },
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
  });
};

exports.down = pgm => {
  pgm.dropTable('comments');
};
