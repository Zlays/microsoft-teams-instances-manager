export interface Settings {
  onStartup: boolean;
  autoLaunch: boolean;
}

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
