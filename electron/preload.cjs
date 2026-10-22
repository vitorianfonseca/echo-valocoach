const { contextBridge, ipcRenderer } = require("electron");
const channels = [
  "state:load",
  "state:save",
  "media:list",
  "media:import",
  "data:import",
  "data:export",
  "data:clear",
  "integration:status",
  "integration:save",
  "ai:ask",
  "riot:matches",
  "capture:sources",
  "capture:select",
  "capture:start",
  "capture:chunk",
  "capture:stop",
  "clip:export",
];
contextBridge.exposeInMainWorld("echoDesktop", {
  call: (channel, ...args) => {
    if (!channels.includes(channel))
      return Promise.reject(new Error("Unsupported operation"));
    return ipcRenderer.invoke(channel, ...args);
  },
});
