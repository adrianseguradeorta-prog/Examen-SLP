export type RecordingState = {
  phase: "idle" | "requesting" | "recording" | "ready" | "error";
  url: string;
  interrupted: boolean;
  seconds: number | null;
  message: string;
};
export const emptyRecording: RecordingState = {
  phase: "idle",
  url: "",
  interrupted: false,
  seconds: null,
  message: "Audio efímero: nunca se sube ni se guarda en almacenamiento local.",
};
type Options = {
  media: () => Promise<MediaStream>;
  recorder: (stream: MediaStream) => MediaRecorder;
  createURL: (blob: Blob) => string;
  revokeURL: (url: string) => void;
  notify: (state: RecordingState) => void;
};
// No fetch, database, FileReader/base64 or persistent storage in this module.
export class EphemeralRecording {
  state = { ...emptyRecording };
  private generation = 0;
  private disposed = false;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(private o: Options) {}
  private emit() {
    if (!this.disposed) this.o.notify({ ...this.state });
  }
  private release() {
    clearTimeout(this.timer);
    if (this.recorder) {
      this.recorder.onstop = null;
      this.recorder.ondataavailable = null;
      this.recorder.onerror = null;
      this.recorder.onpause = null;
      if (this.recorder.state !== "inactive")
        try {
          this.recorder.stop();
        } catch {
          /* already ended */
        }
    }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.recorder = null;
    if (this.state.url) this.o.revokeURL(this.state.url);
  }
  async start() {
    if (
      this.disposed ||
      this.state.phase === "requesting" ||
      this.state.phase === "recording"
    )
      return;
    this.release();
    const g = ++this.generation;
    this.state = {
      ...emptyRecording,
      phase: "requesting",
      message: "Solicitando permiso de micrófono…",
    };
    this.emit();
    try {
      const stream = await this.o.media();
      if (this.disposed || g !== this.generation) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = stream;
      const recorder = this.o.recorder(stream);
      this.recorder = recorder;
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (!this.disposed && g === this.generation && e.data.size)
          chunks.push(e.data);
      };
      recorder.onpause = () => {
        this.state.interrupted = true;
        this.state.seconds = null;
        this.emit();
      };
      recorder.onerror = () => {
        if (g !== this.generation) return;
        ++this.generation;
        this.release();
        chunks.length = 0;
        this.state = {
          ...emptyRecording,
          phase: "error",
          message:
            "La grabación falló. No se ha registrado una tarea completada.",
        };
        this.emit();
      };
      recorder.onstop = () => {
        if (this.disposed || g !== this.generation) return;
        clearTimeout(this.timer);
        this.stream?.getTracks().forEach((t) => t.stop());
        this.stream = null;
        if (!chunks.length) {
          this.state = {
            ...emptyRecording,
            phase: "error",
            message: "No hay audio reproducible. Inténtalo de nuevo.",
          };
          this.emit();
          return;
        }
        const blob = new Blob(chunks, { type: recorder.mimeType });
        chunks.length = 0;
        this.state = {
          ...this.state,
          phase: "ready",
          url: this.o.createURL(blob),
          message: this.state.interrupted
            ? "Grabación interrumpida; no atribuimos una duración fiable. Escúchala antes de registrar qué ocurrió."
            : "Escucha tu respuesta antes de registrar la realización. El audio desaparecerá al salir.",
        };
        this.emit();
      };
      stream.getTracks().forEach((t) => {
        t.addEventListener("mute", () => {
          if (g === this.generation) this.stop(true);
        });
        t.addEventListener("ended", () => {
          if (g === this.generation && this.state.phase === "recording")
            this.stop(true);
        });
      });
      recorder.start(1000);
      this.state.phase = "recording";
      this.state.message =
        "Grabando solo en memoria. Máximo orientativo: cinco minutos.";
      this.emit();
      this.timer = setTimeout(() => this.stop(), 300000);
    } catch (e) {
      if (this.disposed || g !== this.generation) return;
      this.release();
      this.state = {
        ...emptyRecording,
        phase: "error",
        message:
          e instanceof Error ? e.message : "No se pudo abrir el micrófono",
      };
      this.emit();
    }
  }
  stop(interrupted = false) {
    if (this.state.phase === "requesting" && interrupted) {
      ++this.generation;
      this.release();
      this.state = {
        ...emptyRecording,
        phase: "error",
        message: "Se canceló el permiso pendiente al salir de la pantalla.",
      };
      this.emit();
      return;
    }
    if (this.state.phase !== "recording") return;
    this.state.interrupted ||= interrupted;
    if (interrupted) this.state.seconds = null;
    clearTimeout(this.timer);
    if (this.recorder?.state !== "inactive") this.recorder?.stop();
  }
  metadata(seconds: number) {
    if (this.state.phase !== "ready") return;
    this.state.seconds =
      !this.state.interrupted &&
      Number.isFinite(seconds) &&
      seconds >= 1 &&
      seconds <= 600
        ? Math.round(seconds * 10) / 10
        : null;
    this.emit();
  }
  clear() {
    ++this.generation;
    this.release();
    this.state = { ...emptyRecording };
    this.emit();
  }
  dispose() {
    this.disposed = true;
    ++this.generation;
    this.release();
    this.state = { ...emptyRecording };
  }
}
