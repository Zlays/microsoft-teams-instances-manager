import log from 'electron-log';
import fs from 'fs';
import { logsPath } from './ResourcesPath';

log.transports.file.file = `${logsPath}\\log.log`;

function initLogs() {
  if (!fs.existsSync(logsPath)) {
    fs.mkdir(logsPath, (err) => {
      if (err) {
        return log.error(err);
      }
      return log.debug('Profile directory created');
    });
  }
}

initLogs();

export default function Logger(text, level?: string) {
  initLogs();
  switch (level) {
    case 'info':
      log.info(text);
      break;
    case 'debug':
      log.debug(text);
      break;
    case 'error':
      log.error(text);
      break;
    default:
      log.debug(text);
  }
}
