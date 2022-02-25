const hoaxer = require('hoaxer');
const express = require("express");
const mysql = require('mysql');

async function buildPeopleRepository() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
  });

  const query = async (queryStr) => {
    return new Promise((resolve, reject) => {
      pool.query(queryStr, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  const listNames = async () => {
    const data = await query('SELECT name FROM people');
    return data.map(data => data.name);
  }

  const createTable = async () => {
    await query(`
      CREATE TABLE IF NOT EXISTS people(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
      ) ENGINE=INNODB;
    `)
  }

  const insertName = async (name) => {
    await query(`INSERT INTO people (name) VALUES ('${name}')`)
  }

  await createTable();

  return { pool, query, listNames, insertName };
}

async function buildApp(repository) {
  const app = express()
    .get('/', async (_, res) => {
      const name = hoaxer.name.findName();
      await repository.insertName(name);
      const names = await repository.listNames();
      res.send(`
        <h1>Full Cycle Rocks!</h1>
        <ul>
          ${names.map(name => (`<li>${name}</li>`)).join('\n')}
        </ul>
      `)
    })
  return app
}

buildPeopleRepository()
  .then(repo => buildApp(repo)
    .then(app => app.listen(3000, () => { 
      console.log('app is running') 
    })))
  .catch(error => {
    console.error(error);
    process.exit(1);
  })