import os from 'os';

const userPath = os.homedir();

export const teamsPath = userPath.concat('\\AppData\\Local\\Microsoft\\Teams');

export const homePath = __dirname;

export const profilesPath = homePath.concat('\\profiles');
