export default function sendAsync(channel: string, args: any) {
  return new Promise((resolve) => {
    window.electron.ipcRenderer.once(channel, (_, arg) => {
      resolve(_);
    });
    window.electron.ipcRenderer.sendMessage(`os-async`, [channel, args]);
  });
}
