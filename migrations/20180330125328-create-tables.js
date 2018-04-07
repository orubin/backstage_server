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

exports.up = function(db, callback) {
  db.createTable('users', {
    id: 'int',
    name: 'varchar',
    username: 'varchar',
    email: 'varchar',
    password: 'varchar',
    description: 'varchar',
    profile_image: 'varchar'
  }, {
    'primary_key': 'id'
  }, callback);

  db.createTable('creators', {
    id: 'int',
    name: 'varchar',
    username: 'varchar',
    email: 'varchar',
    password: 'varchar',
    description: 'varchar',
    welcome_video: 'varchar',
    paypal_account: 'varchar',
    supporters: 'varchar',
    posts: 'varchar',
    rewards: 'varchar',
    profile_image: 'varchar',
    category: 'varchar'
  }, {
    'primary_key': 'id'
  }, callback);

  db.createTable('rewards', {
    id: 'int',
    name: 'varchar',
    image: 'varchar',
    description: 'varchar',
    price: 'float'
  }, {
    'primary_key': 'id'
  }, callback);

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
