export type Review = {
  mediaId: string;
  name: string;
  start: number;
  end: number;
  times: number[];
  frames: string[];
};
export async function extractFrames(
  video: HTMLVideoElement,
  start: number,
  end: number,
) {
  if (
    !Number.isFinite(video.duration) ||
    start < 0 ||
    end <= start ||
    end > video.duration
  )
    throw new Error("Seleciona um intervalo válido do vídeo.");
  const previous = video.currentTime,
    wasPlaying = !video.paused;
  video.pause();
  const times = Array.from({ length: 4 }, (_, i) =>
    Math.max(
      start,
      Math.min(video.duration - 0.05, start + ((end - start) * i) / 3),
    ),
  );
  const frames: string[] = [];
  try {
    for (const time of times) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error("O vídeo demorou demasiado a preparar o frame."));
        }, 10000);
        const done = () => {
          cleanup();
          resolve();
        };
        const fail = () => {
          cleanup();
          reject(new Error("Não foi possível ler o vídeo."));
        };
        const cleanup = () => {
          clearTimeout(timeout);
          video.removeEventListener("seeked", done);
          video.removeEventListener("error", fail);
          video.removeEventListener("loadeddata", done);
        };
        if (
          Math.abs(video.currentTime - time) < 0.01 &&
          video.readyState >= 2
        ) {
          done();
          return;
        }
        video.addEventListener("seeked", done, { once: true });
        video.addEventListener("error", fail, { once: true });
        video.currentTime = time;
      });
      const canvas = document.createElement("canvas");
      canvas.width = Math.min(1280, video.videoWidth);
      canvas.height = Math.round(
        (video.videoHeight * canvas.width) / video.videoWidth,
      );
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas indisponível");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frames.push(canvas.toDataURL("image/jpeg", 0.8));
    }
    return { times, frames };
  } finally {
    video.currentTime = previous;
    if (wasPlaying) await video.play().catch(() => {});
  }
}
