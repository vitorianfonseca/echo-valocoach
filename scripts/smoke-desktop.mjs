import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";
const data = await fs.mkdtemp(path.join(os.tmpdir(), "echo-smoke-"));
const video = path.join(data, "test.mp4"),
  clip = path.join(data, "clip.mp4");
execFileSync(
  ffmpeg,
  [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "color=c=black:s=320x240:d=3",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    video,
  ],
  { stdio: "ignore" },
);
const app = await electron.launch({
  args: ["."],
  env: { ...process.env, ECHO_DATA_DIR: data, ECHO_DEV: "0" },
});
try {
  const page = await app.firstWindow();
  await page.waitForSelector('[data-node-id="12:2"]');
  await app.evaluate(({ dialog }, file) => {
    dialog.showOpenDialog = async () => ({
      canceled: false,
      filePaths: [file],
    });
  }, video);
  const imported = await page.evaluate(() =>
    window.echoDesktop.call("media:import"),
  );
  assert.equal(imported.length, 1);
  assert.ok(imported[0].url.startsWith("echo-media://"));
  const metadata = await page.evaluate(async (url) => {
    const v = document.createElement("video");
    v.src = url;
    return await new Promise((resolve, reject) => {
      v.onloadedmetadata = () =>
        resolve({ duration: v.duration, width: v.videoWidth });
      v.onerror = () => reject(new Error("Video failed"));
    });
  }, imported[0].url);
  assert.equal(metadata.width, 320);
  assert.equal(metadata.duration, 3);
  await app.evaluate(({ dialog }, file) => {
    dialog.showSaveDialog = async () => ({ canceled: false, filePath: file });
  }, clip);
  const exported = await page.evaluate(
    async (id) =>
      window.echoDesktop.call("clip:export", { mediaId: id, start: 0, end: 1 }),
    imported[0].id,
  );
  assert.equal(exported, true);
  assert.ok((await fs.stat(clip)).size > 100);
  const status = await page.evaluate(() =>
    window.echoDesktop.call("integration:status"),
  );
  assert.equal(status.ai, false);
  const error = await page.evaluate(async () => {
    try {
      await window.echoDesktop.call("ai:ask", { question: "teste" });
      return "";
    } catch (e) {
      return e.message;
    }
  });
  assert.match(error, /Configura a chave/);
  await page.evaluate(() =>
    window.echoDesktop.call("state:save", { version: 1, test: "persisted" }),
  );
  assert.equal(
    (await page.evaluate(() => window.echoDesktop.call("state:load"))).test,
    "persisted",
  );
  await page.screenshot({ path: "../../work/echo-desktop.png" });
  console.log(
    JSON.stringify({
      desktop: true,
      videoImport: true,
      videoPlayback: true,
      clipExport: true,
      persistence: true,
      missingAIKeyHandled: true,
    }),
  );
} finally {
  await app.close();
  await fs.rm(data, { recursive: true, force: true });
}
