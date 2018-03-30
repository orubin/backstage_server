'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  db.createTable('users', {
    id: { type: 'int', primaryKey: true },
    name: 'string',
    username: 'string',
    email: 'string',
    password: 'string',
    description: 'string',
    profile_image: 'string'
  });

  db.createTable('creators', {
    id: { type: 'int', primaryKey: true },
    name: 'string',
    username: 'string',
    email: 'string',
    password: 'string',
    description: 'string',
    welcome_video: 'string',
    paypal_account: 'string',
    supporters: 'string',
    posts: 'string',
    rewards: 'string',
    profile_image: 'string',
    category: 'string'
  });

  db.createTable('rewards', {
    id: { type: 'int', primaryKey: true },
    name: 'string',
    image: 'string',
    description: 'string',
    price: 'float'
  });
  return null;
};

exports.down = function(db) {
  db.dropTable('users', callback);
  db.dropTable('creators', callback);
  db.dropTable('rewards', callback);

  return null;
};

exports._meta = {
  "version": 1
};
