import {NoteConfig} from './types';

export const keyConfigs: {
  black: NoteConfig[],
  white: NoteConfig[]
} = {
  black: [
    {
      note: "F",
      bind: 'w',
      isSharp: true,
      octaveAdjustment: -1
    },
    {
      note: "G",
      bind: 'e',
      isSharp: true,
      octaveAdjustment: -1
    },
    {
      note: "A",
      bind: 'r',
      isSharp: true,
      octaveAdjustment: -1
    },
    {
      note: "C",
      bind: 'y',
      isSharp: true,
    },
    {
      note: "D",
      bind: 'u',
      isSharp: true,
    },
    {
      note: "F",
      bind: 'o',
      isSharp: true,
    },
    {
      note: "G",
      bind: 'p',
      isSharp: true,
    },
    {
      note: "A",
      bind: '[',
      isSharp: true,
    }
  ],
  white: [
    {
      note: 'F',
      bind: 'a',
      octaveAdjustment: -1
    },
    {
      note: 'G',
      bind: 's',
      octaveAdjustment: -1
    },
    {
      note: 'A',
      bind: 'd',
      octaveAdjustment: -1
    },
    {
      note: 'B',
      bind: 'f',
      octaveAdjustment: -1
    },
    {
      note: 'C',
      bind: 'g',
    },
    {
      note: 'D',
      bind: 'h',
    },
    {
      note: 'E',
      bind: 'j',
    },
    {
      note: 'F',
      bind: 'k',
    },
    {
      note: 'G',
      bind: 'l',
    },
    {
      note: 'A',
      bind: ';',
    },
    {
      note: 'B',
      bind: '\'',
    },
  ]
};

export const keyBindingToNoteConfig = [...keyConfigs.black, ...keyConfigs.white].reduce((acc: { [key: string]: NoteConfig }, noteConfig: NoteConfig) => {
  if (!noteConfig?.bind)
    return acc
  return { ...acc, [noteConfig.bind]: noteConfig }
}, {})
