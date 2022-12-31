import dayjs from 'dayjs';
import { MIGRATION_PATH } from '../utils/Paths';
import { database } from './OsService';
import { sleep } from '../utils/Utils';

const fs = require('fs');

function initDBMigration() {
  const sql = `create table if not exists migration
               (
                 version
                 TEXT
                 not
                 null
                 constraint
                 key_migration
                 primary
                 key,
                 date
                 TEXT,
                 status
                 TEXT
               )
  `;

  return new Promise(function (resolve, reject) {
    database.run(sql, (err) => {
      if (err) return reject(err);
      resolve(true);
    });
  });
}

function getMigrationSql(version: string): string {
  return `SELECT *
          FROM migration
          where version = '${version}'`;
}

function addMigration(version: string, status: string) {
  const sql = `INSERT INTO migration(version, date, status)
               VALUES ('${version}', '${dayjs(
    new Date()
  ).toString()}', '${status}')`;
  database.run(sql, (err) => {
    if (err) {
      console.log(err);
    }
  });

  console.log(`[MIGRATION] added version: ${version} - status: ${status}`);
}

function migrate() {
  return new Promise(function (resolve, reject) {
    fs.readdir(MIGRATION_PATH, function (err, files) {
      if (err) return reject(err);

      files.forEach(function (file: string, index: number) {
        const version = file.replace('.sql', '');
        database.all(getMigrationSql(version), (err, rows) => {
          if (err) return reject(err);

          const process = new Promise(function (resolve, reject) {
            if (rows.length <= 0) {
              try {
                const sqList = fs
                  .readFileSync(MIGRATION_PATH.concat(`/${file}`), 'utf8')
                  .split(';');
                console.log(sqList.join(';'));

                database.serialize(() => {
                  database.run('PRAGMA foreign_keys=OFF;');
                  database.run('BEGIN TRANSACTION;');
                  sqList.forEach(function (sql: string) {
                    database.run(`${sql};`, (error) => {
                      if (error) {
                        console.log(error);
                      }
                    });
                  });
                  database.run('COMMIT;');
                });
                addMigration(version, `OK`);
                resolve(true);
              } catch (err) {
                if (err) reject(err);
              }
            } else {
              console.log(`[MIGRATION] version: ${version} already exists`);
            }
          });
          process
            .then(() => {
              if (files.length - 1 === index) {
                resolve(true);
              }
            })
            .catch((e) => reject(e));
        });
      });
    });
  });
}

function runMigration() {
  sleep(200)
    .then(() => {
      console.log('[MIGRATION] START');
      initDBMigration()
        .then(() => {
          migrate()
            .then(() => {
              console.log('[MIGRATION] END');
            })
            .catch((err) => console.log(`[MIGRATION] error:${err}`));
        })
        .catch((err) => console.log(`[MIGRATION] error:${err}`));
    })
    .catch((err) => console.log(`[MIGRATION] error:${err}`));
}

export default runMigration;
