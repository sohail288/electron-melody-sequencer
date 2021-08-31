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

export type Nullable<T> = T | null
