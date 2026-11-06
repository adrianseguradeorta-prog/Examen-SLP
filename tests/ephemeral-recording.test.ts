import { afterEach, expect, it, vi } from "vitest";
import { EphemeralRecording } from "../src/lib/ephemeral-recording";
class Track extends EventTarget {
  stop = vi.fn();
}
class Recorder {
  state: "inactive" | "recording" = "inactive";
  mimeType = "audio/webm";
  ondataavailable: ((e: BlobEvent) => void) | null = null;
  onstop: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onpause: (() => void) | null = null;
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["fake audio"]) } as BlobEvent);
    this.onstop?.();
  }
}
const instances: EphemeralRecording[] = [];
function fixture(media?: () => Promise<MediaStream>) {
  const track = new Track();
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  const recorder = new Recorder();
  const createURL = vi.fn(() => "blob:ephemeral-only");
  const revokeURL = vi.fn();
  const capture = new EphemeralRecording({
    media: media ?? (async () => stream),
    recorder: () => recorder as unknown as MediaRecorder,
    createURL,
    revokeURL,
    notify: vi.fn(),
  });
  instances.push(capture);
  return { capture, track, stream, recorder, createURL, revokeURL };
}
afterEach(() => {
  instances.forEach((c) => c.dispose());
  instances.length = 0;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("keeps audio only in a blob URL, releases tracks and revokes audio on leaving", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  const f = fixture();
  await f.capture.start();
  expect(f.capture.state.phase).toBe("recording");
  f.capture.stop();
  expect(f.capture.state.phase).toBe("ready");
  expect(f.track.stop).toHaveBeenCalled();
  f.capture.metadata(42.37);
  expect(f.capture.state.seconds).toBe(42.4);
  f.capture.dispose();
  expect(f.revokeURL).toHaveBeenCalledWith("blob:ephemeral-only");
  expect(f.capture.state.url).toBe("");
  expect(fetch).not.toHaveBeenCalled();
});
it("never treats permission denial as completion", async () => {
  const f = fixture(async () => {
    throw Error("Permission denied");
  });
  await f.capture.start();
  expect(f.capture.state.phase).toBe("error");
  expect(f.createURL).not.toHaveBeenCalled();
  expect(f.capture.state.seconds).toBeNull();
});
it("stops a microphone granted after the component was disposed", async () => {
  let grant!: (s: MediaStream) => void;
  const f = fixture(
    () =>
      new Promise((r) => {
        grant = r;
      }),
  );
  const starting = f.capture.start();
  f.capture.dispose();
  grant(f.stream);
  await starting;
  expect(f.track.stop).toHaveBeenCalled();
  expect(f.recorder.state).toBe("inactive");
  expect(f.createURL).not.toHaveBeenCalled();
});
it("records interruptions but withholds unreliable durations", async () => {
  const f = fixture();
  await f.capture.start();
  f.track.dispatchEvent(new Event("mute"));
  expect(f.capture.state.interrupted).toBe(true);
  f.capture.metadata(40);
  expect(f.capture.state.seconds).toBeNull();
});
it("withholds infinite metadata and clears memory when explicitly discarded", async () => {
  const f = fixture();
  await f.capture.start();
  f.capture.stop();
  f.capture.metadata(Infinity);
  expect(f.capture.state.seconds).toBeNull();
  f.capture.clear();
  expect(f.revokeURL).toHaveBeenCalledTimes(1);
  expect(f.capture.state.phase).toBe("idle");
});
it("caps a recording at five minutes without leaving an active microphone", async () => {
  vi.useFakeTimers();
  const f = fixture();
  await f.capture.start();
  await vi.advanceTimersByTimeAsync(300000);
  expect(f.recorder.state).toBe("inactive");
  expect(f.track.stop).toHaveBeenCalled();
  expect(f.capture.state.seconds).toBeNull(); // Only file metadata can supply a duration.
});
it("discards an errored capture and does not produce a completed sample", async () => {
  const f = fixture();
  await f.capture.start();
  f.recorder.onerror?.();
  expect(f.capture.state.phase).toBe("error");
  expect(f.createURL).not.toHaveBeenCalled();
  expect(f.track.stop).toHaveBeenCalled();
});
