import os from 'os';

const userPath = os.homedir();

export const teamsPath = userPath.concat('\\AppData\\Local\\Microsoft\\Teams');

export const homePath = __dirname.substring(0, __dirname.lastIndexOf('\\'));

export const profilesPath = homePath.concat('\\profiles');

export const logsPath = homePath.concat('\\logs');

export const configPath = homePath.concat('\\config');
