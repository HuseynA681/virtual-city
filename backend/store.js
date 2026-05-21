const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DB_FOLDER = path.join(__dirname, 'data');
const JSON_PATH = path.join(DB_FOLDER, 'db.json');
const DB_TYPE = (process.env.DB_TYPE || 'mysql').toLowerCase();
const IS_HOSTED = Boolean(process.env.RENDER || process.env.NETLIFY || process.env.NODE_ENV === 'production');

const defaultData = {
  users: [],
  messages: [],
  items: [],
  clans: [],
  marketplaceListings: []
};

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

let pool;
let cachedData;

const parseJson = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseArray = (value) => {
  const parsed = parseJson(value);
  return Array.isArray(parsed) ? parsed : [];
};

const serialize = (value) => (value === undefined ? null : JSON.stringify(value));

const parseMysqlUrl = () => {
  const rawUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (!rawUrl) return {};

  try {
    const url = new URL(rawUrl);
    if (!url.protocol.startsWith('mysql')) return {};

    return {
      host: url.hostname,
      port: Number(url.port) || 3306,
      user: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      database: decodeURIComponent(url.pathname.replace(/^\//, ''))
    };
  } catch {
    throw new Error('Invalid MYSQL_URL/DATABASE_URL. Expected mysql://user:password@host:3306/database');
  }
};

const mysqlConfig = () => {
  const urlConfig = parseMysqlUrl();
  const config = {
    host: process.env.MYSQL_HOST || urlConfig.host || (IS_HOSTED ? undefined : 'localhost'),
    port: Number(process.env.MYSQL_PORT || urlConfig.port) || 3306,
    user: process.env.MYSQL_USER || urlConfig.user || (IS_HOSTED ? undefined : 'root'),
    password: process.env.MYSQL_PASSWORD || urlConfig.password || '',
    database: process.env.MYSQL_DATABASE || urlConfig.database || (IS_HOSTED ? undefined : 'virtual_city'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true,
    decimalNumbers: true
  };

  if (DB_TYPE === 'mysql' && IS_HOSTED) {
    const missing = ['host', 'user', 'database'].filter((key) => !config[key]);
    if (missing.length > 0) {
      throw new Error(
        `Missing MySQL environment variables on deploy: ${missing.join(', ')}. ` +
        'Set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, and MYSQL_PORT in Render, or set MYSQL_URL.'
      );
    }
  }

  return config;
};

const createDatabaseIfNeeded = async () => {
  const shouldCreateDatabase = process.env.MYSQL_CREATE_DATABASE === 'true' || (!IS_HOSTED && process.env.MYSQL_CREATE_DATABASE !== 'false');
  if (!shouldCreateDatabase) return;

  const { host, port, user, password, database } = mysqlConfig();
  const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
  await connection.end();
};

const getPool = async () => {
  if (!pool) {
    await createDatabaseIfNeeded();
    pool = mysql.createPool(mysqlConfig());
  }
  return pool;
};

const loadSqlDatabase = async () => {
  const pool = await getPool();
  const [users] = await pool.query('SELECT * FROM users');
  const [messages] = await pool.query('SELECT * FROM messages');
  const [items] = await pool.query('SELECT * FROM items');
  const [clans] = await pool.query('SELECT * FROM clans');
  const [marketplaceListings] = await pool.query('SELECT * FROM marketplaceListings');

  cachedData = {
    users: users.map(mapRow),
    messages: messages.map(mapRow),
    items: items.map(mapRow),
    clans: clans.map(mapRow),
    marketplaceListings: marketplaceListings.map(mapRow)
  };

  return cachedData;
};

const ensureDatabase = async () => {
  if (!fs.existsSync(DB_FOLDER)) {
    fs.mkdirSync(DB_FOLDER, { recursive: true });
  }

  if (DB_TYPE === 'json') {
    if (!fs.existsSync(JSON_PATH)) {
      fs.writeFileSync(JSON_PATH, JSON.stringify(defaultData, null, 2));
    }
    return;
  }

  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      _id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(255),
      email VARCHAR(255),
      password TEXT,
      avatar TEXT,
      bio TEXT,
      level INT DEFAULT 0,
      coins INT DEFAULT 0,
      premium TINYINT DEFAULT 0,
      friends TEXT,
      clan VARCHAR(64),
      clanRole VARCHAR(255),
      inventory TEXT,
      xp INT DEFAULT 0,
      achievements TEXT,
      lastLogin VARCHAR(64),
      notifications TINYINT DEFAULT 0,
      darkMode TINYINT DEFAULT 0,
      isAdmin TINYINT DEFAULT 0,
      isBanned TINYINT DEFAULT 0,
      createdAt VARCHAR(64),
      updatedAt VARCHAR(64)
    );
    CREATE TABLE IF NOT EXISTS messages (
      _id VARCHAR(64) PRIMARY KEY,
      sender VARCHAR(64),
      senderName VARCHAR(255),
      senderAvatar TEXT,
      content TEXT,
      channel VARCHAR(255),
      recipient VARCHAR(64),
      clan VARCHAR(64),
      edited TINYINT DEFAULT 0,
      editedAt VARCHAR(64),
      deleted TINYINT DEFAULT 0,
      reactions TEXT,
      createdAt VARCHAR(64),
      updatedAt VARCHAR(64)
    );
    CREATE TABLE IF NOT EXISTS items (
      _id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255),
      description TEXT,
      type VARCHAR(255),
      rarity VARCHAR(255),
      price INT DEFAULT 0,
      icon TEXT,
      sellable TINYINT DEFAULT 0,
      tradeable TINYINT DEFAULT 0,
      color VARCHAR(255),
      size TEXT,
      owner VARCHAR(64),
      createdAt VARCHAR(64),
      updatedAt VARCHAR(64)
    );
    CREATE TABLE IF NOT EXISTS clans (
      _id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255),
      description TEXT,
      icon TEXT,
      leader VARCHAR(64),
      members TEXT,
      moderators TEXT,
      level INT DEFAULT 0,
      experience INT DEFAULT 0,
      treasury INT DEFAULT 0,
      joinApprovalRequired TINYINT DEFAULT 0,
      maxMembers INT DEFAULT 0,
      wins INT DEFAULT 0,
      losses INT DEFAULT 0,
      createdAt VARCHAR(64),
      updatedAt VARCHAR(64)
    );
    CREATE TABLE IF NOT EXISTS marketplaceListings (
      _id VARCHAR(64) PRIMARY KEY,
      item VARCHAR(64),
      seller VARCHAR(64),
      price INT DEFAULT 0,
      quantity INT DEFAULT 0,
      status VARCHAR(255),
      buyer VARCHAR(64),
      soldAt VARCHAR(64),
      category VARCHAR(255),
      rarity VARCHAR(255),
      ratings TEXT,
      expiresAt VARCHAR(64),
      createdAt VARCHAR(64),
      updatedAt VARCHAR(64)
    );
  `);

  await loadSqlDatabase();
};

const loadDatabase = () => {
  if (DB_TYPE === 'json') {
    if (!fs.existsSync(JSON_PATH)) {
      fs.writeFileSync(JSON_PATH, JSON.stringify(defaultData, null, 2));
    }
    try {
      const raw = fs.readFileSync(JSON_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch {
      fs.writeFileSync(JSON_PATH, JSON.stringify(defaultData, null, 2));
      return { ...defaultData };
    }
  }

  if (!cachedData) {
    throw new Error('Database has not been initialized. Call ensureDatabase() before using the store.');
  }

  return cachedData;
};

const mapRow = (row) => {
  const mapped = {
    ...row,
    friends: parseArray(row.friends),
    inventory: parseArray(row.inventory),
    achievements: parseArray(row.achievements),
    reactions: parseArray(row.reactions),
    size: parseJson(row.size) || {},
    members: parseArray(row.members),
    moderators: parseArray(row.moderators),
    ratings: parseJson(row.ratings) || { averageRating: 5, reviews: [] },
    premium: Boolean(row.premium),
    notifications: Boolean(row.notifications),
    darkMode: Boolean(row.darkMode),
    isAdmin: Boolean(row.isAdmin),
    isBanned: Boolean(row.isBanned),
    edited: Boolean(row.edited),
    deleted: Boolean(row.deleted),
    sellable: Boolean(row.sellable),
    tradeable: Boolean(row.tradeable),
    joinApprovalRequired: Boolean(row.joinApprovalRequired)
  };

  Object.keys(mapped).forEach((key) => {
    if (mapped[key] === null) mapped[key] = undefined;
  });

  return mapped;
};

const saveCollection = async (connection, table, items, columns) => {
  if (!items || items.length === 0) {
    return;
  }

  const placeholders = columns.map(() => '?').join(', ');
  const statement = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

  for (const item of items) {
    const row = columns.map((column) => {
      if (['friends', 'inventory', 'achievements', 'reactions', 'size', 'members', 'moderators', 'ratings'].includes(column)) {
        return serialize(item[column]);
      }
      return item[column] === undefined ? null : item[column];
    });
    await connection.query(statement, row);
  }
};

const persistDatabase = async (data) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM messages');
    await connection.query('DELETE FROM items');
    await connection.query('DELETE FROM clans');
    await connection.query('DELETE FROM marketplaceListings');

    await saveCollection(connection, 'users', data.users || [], [
      '_id', 'username', 'email', 'password', 'avatar', 'bio', 'level', 'coins', 'premium', 'friends', 'clan', 'clanRole', 'inventory', 'xp', 'achievements', 'lastLogin', 'notifications', 'darkMode', 'isAdmin', 'isBanned', 'createdAt', 'updatedAt'
    ]);

    await saveCollection(connection, 'messages', data.messages || [], [
      '_id', 'sender', 'senderName', 'senderAvatar', 'content', 'channel', 'recipient', 'clan', 'edited', 'editedAt', 'deleted', 'reactions', 'createdAt', 'updatedAt'
    ]);

    await saveCollection(connection, 'items', data.items || [], [
      '_id', 'name', 'description', 'type', 'rarity', 'price', 'icon', 'sellable', 'tradeable', 'color', 'size', 'owner', 'createdAt', 'updatedAt'
    ]);

    await saveCollection(connection, 'clans', data.clans || [], [
      '_id', 'name', 'description', 'icon', 'leader', 'members', 'moderators', 'level', 'experience', 'treasury', 'joinApprovalRequired', 'maxMembers', 'wins', 'losses', 'createdAt', 'updatedAt'
    ]);

    await saveCollection(connection, 'marketplaceListings', data.marketplaceListings || [], [
      '_id', 'item', 'seller', 'price', 'quantity', 'status', 'buyer', 'soldAt', 'category', 'rarity', 'ratings', 'expiresAt', 'createdAt', 'updatedAt'
    ]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const writeDatabase = (data) => {
  if (DB_TYPE === 'json') {
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2));
    return;
  }

  cachedData = data;
  persistDatabase(data).catch((error) => {
    console.error('Failed to persist database to MySQL:', error);
  });
};

const getCollection = (data, collection) => {
  if (!data[collection]) data[collection] = [];
  return data[collection];
};

const findById = (data, collection, id) => getCollection(data, collection).find((item) => item._id === String(id));
const findOne = (data, collection, predicate) => getCollection(data, collection).find(predicate);
const filter = (data, collection, predicate) => getCollection(data, collection).filter(predicate);
const count = (data, collection, predicate) => (predicate ? filter(data, collection, predicate).length : getCollection(data, collection).length);

const insert = (data, collection, record) => {
  const newRecord = { _id: createId(), createdAt: new Date().toISOString(), ...record };
  getCollection(data, collection).push(newRecord);
  writeDatabase(data);
  return newRecord;
};

const updateById = (data, collection, id, updates) => {
  const record = findById(data, collection, id);
  if (!record) return null;
  Object.assign(record, updates);
  record.updatedAt = new Date().toISOString();
  writeDatabase(data);
  return record;
};

const deleteById = (data, collection, id) => {
  const coll = getCollection(data, collection);
  const index = coll.findIndex((item) => item._id === String(id));
  if (index === -1) return false;
  coll.splice(index, 1);
  writeDatabase(data);
  return true;
};

const populateUser = (user, data) => {
  if (!user) return null;
  const cleanUser = { ...user };
  delete cleanUser.password;
  cleanUser.id = cleanUser._id;
  
  // Ensure role is set
  if (!cleanUser.role) {
    cleanUser.role = user.isAdmin ? 'admin' : 'user';
  }

  cleanUser.friends = (user.friends || [])
    .map((friendId) => findById(data, 'users', friendId))
    .filter(Boolean)
    .map((friend) => ({
      id: friend._id,
      username: friend.username,
      avatar: friend.avatar,
      level: friend.level
    }));

  cleanUser.clan = user.clan ? findById(data, 'clans', user.clan) : null;
  if (cleanUser.clan) {
    cleanUser.clan = {
      id: cleanUser.clan._id,
      name: cleanUser.clan.name,
      icon: cleanUser.clan.icon,
      level: cleanUser.clan.level
    };
  }

  cleanUser.inventory = (user.inventory || [])
    .map((itemId) => findById(data, 'items', itemId))
    .filter(Boolean)
    .map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      type: item.type,
      rarity: item.rarity,
      price: item.price,
      icon: item.icon,
      owner: item.owner
    }));

  return cleanUser;
};

module.exports = {
  ensureDatabase,
  readDatabase: loadDatabase,
  writeDatabase,
  findById,
  findOne,
  filter,
  count,
  insert,
  updateById,
  deleteById,
  populateUser
};
