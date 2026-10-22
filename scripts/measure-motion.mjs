import { _electron as electron } from "@playwright/test";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
const data = await fs.mkdtemp(path.join(os.tmpdir(), "echo-motion-"));
const app = await electron.launch({
  args: ["."],
  env: { ...process.env, ECHO_DATA_DIR: data, ECHO_DEV: "0" },
});
try {
  const page = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }) => {
    const w = BrowserWindow.getAllWindows()[0];
    w.webContents.setBackgroundThrottling(false);
    w.show();
    w.focus();
  });
  await page.bringToFront();
  await page.getByRole("button", { name: "Usar a app", exact: true }).click();
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    window.motionSample = { frames: [], longTasks: [], active: true };
    const sample = window.motionSample;
    let previous = performance.now();
    const tick = (now) => {
      sample.frames.push(now - previous);
      previous = now;
      if (sample.active) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    new PerformanceObserver((list) => {
      sample.longTasks.push(...list.getEntries().map((e) => e.duration));
    }).observe({ entryTypes: ["longtask"] });
  });
  for (const number of [2, 3, 4, 5, 6, 7, 1]) {
    await page.keyboard.press(`Alt+${number}`);
    await page.waitForTimeout(700);
  }
  const result = await page.evaluate(() => {
    const s = window.motionSample;
    s.active = false;
    const sorted = s.frames.slice(1).sort((a, b) => a - b);
    return {
      visible: document.visibilityState,
      focused: document.hasFocus(),
      samples: sorted.length,
      medianFrameMs: sorted[Math.floor(sorted.length * 0.5)],
      p95FrameMs: sorted[Math.floor(sorted.length * 0.95)],
      framesOver33ms: sorted.filter((n) => n > 33.4).length,
      longTasksOver50ms: s.longTasks,
      activeIdleAnimations: document
        .getAnimations()
        .filter((a) => a.playState === "running").length,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };
  });
  console.log(JSON.stringify(result, null, 2));
  await fs.writeFile(
    "../../work/motion-performance.json",
    JSON.stringify(result, null, 2),
  );
} finally {
  await app.close();
  await fs.rm(data, { recursive: true, force: true });
}
