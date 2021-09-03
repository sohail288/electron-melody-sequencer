export enum StepValueEnum {
  OFF,
  ON,
  ACCENT
}

export enum ModeEnum {
  PLAYING,
  STOPPED,
  PAUSED
}

export interface DrumSynthState {
  transport: {
    mode: ModeEnum,
    bpm: number,
  },
  pattern: {
    stepCounter: number,
    currentPattern?: number,
    tracks: StepValueEnum[][] /* array of arrays of step values */
  },
  trackConfig?: {
    name: string
  }[],
  currentTrack?: number,
}

export type Note = "A" | "B" | "C" | "D" | "E" | "F" | "G"
export type Octave = number

export interface Envelope {
  attack: number;
  delay: number;
  sustain: number;
  release: number;
}

export interface StepParams {
  state: StepValueEnum;
  note: Note;
  octave?: Octave;
  isSharp?: boolean;
  recordedParameters?: {
    recordedVolume?: number
    recordedPan?: number,
    envelope?: Envelope
  }
}

export type Nullable<T> = T | null

export interface NoteConfig {
  note: Note;
  bind?: string;
  octaveAdjustment?: number;
  isSharp?: boolean
}

export type SelectedNote = { octave: number } & NoteConfig

