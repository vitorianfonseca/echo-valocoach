import { hydrate, initialState, type State } from "./model";
declare global {
  interface Window {
    echoDesktop?: { call: (channel: string, ...args: any[]) => Promise<any> };
  }
}
export const desktop = !!window.echoDesktop;
export const call = (channel: string, ...args: any[]) =>
  window.echoDesktop
    ? window.echoDesktop.call(channel, ...args)
    : Promise.reject(
        new Error("Esta operação está disponível na aplicação desktop."),
      );
export async function loadState() {
  if (desktop) return hydrate(await call("state:load"));
  try {
    return hydrate(JSON.parse(localStorage.getItem("echo-state") || "null"));
  } catch {
    return structuredClone(initialState);
  }
}
export async function saveState(state: State) {
  if (desktop) await call("state:save", state);
  else localStorage.setItem("echo-state", JSON.stringify(state));
}
export type Media = {
  id: string;
  name: string;
  url: string;
  size: number;
  createdAt: string;
  kind: string;
};
export async function importMedia(): Promise<Media[]> {
  if (desktop) return call("media:import");
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "video/*";
    input.multiple = true;
    input.oncancel = () => resolve([]);
    input.onchange = () =>
      resolve(
        Array.from(input.files || []).map((f) => ({
          id: crypto.randomUUID(),
          name: f.name,
          url: URL.createObjectURL(f),
          size: f.size,
          createdAt: new Date().toISOString(),
          kind: "browser-session",
        })),
      );
    input.click();
  });
}
export function downloadJSON(value: unknown, name = "echo-backup.json") {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
