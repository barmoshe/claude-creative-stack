declare module "midi-writer-js" {
  // midi-writer-js ships its own types but its package.json exports field hides
  // them; re-declare a permissive shape we use here.
  interface NoteEventOptions {
    pitch: number[] | string[];
    duration: string;
    velocity?: number;
    startTick?: number;
    channel?: number;
  }
  class NoteEvent {
    constructor(opts: NoteEventOptions);
  }
  class Track {
    setTempo(bpm: number): void;
    setTimeSignature(numerator: number, denominator: number): void;
    addTrackName(name: string): void;
    addEvent(event: NoteEvent): void;
  }
  class Writer {
    constructor(tracks: Track[]);
    dataUri(): string;
    buildFile(): Uint8Array;
  }
  const _default: { Track: typeof Track; NoteEvent: typeof NoteEvent; Writer: typeof Writer };
  export default _default;
  export { Track, NoteEvent, Writer };
}
