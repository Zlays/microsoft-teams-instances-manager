import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import fs from 'fs';
import { profilesPath, teamsPath } from '../utils/ResourcesPath';
import Logger from '../utils/Logger';

ipcMain.on('os-spawn', (event, arg) => {
  spawn('powershell', [`start ${teamsPath}\\current\\Teams.exe`], {
    env: { USERPROFILE: profilesPath.concat('\\', arg[1]) },
  });

  event.reply(arg[0], 'ok');
});

ipcMain.on('os-fs-mkdir', (event, arg) => {
  fs.mkdir(arg[1], (err) => {
    if (err) {
      return Logger(err, 'error');
    }
    return Logger(`Directory created successfully: ${arg[1]}`);
  });

  event.reply(arg[0], 'ok');
});

ipcMain.on('os-fs-rmdir', (event, arg) => {
  fs.rmdir(arg[1], { recursive: true }, (err) => {
    if (err) {
      Logger('Please close Teams before deleting the profile');
    }
  });

  event.reply(arg[0], 'ok');
});

ipcMain.on('os-fs-read', (event, arg) => {
  let data: string;
  data = fs.readFileSync(arg[1], 'utf8');

  event.reply(arg[0], data);
});
