const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
});

module.exports = pool;