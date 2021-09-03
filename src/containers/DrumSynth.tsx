import React from 'react'
import * as Tone from 'tone'
import ActionLedButton from '../components/ActionLedButton';
import Display from '../components/Display';
import GlobalTransport from '../components/GlobalTransport';
import TrackController from '../components/TrackController';
import TrackControls from '../components/TrackControls';
import { useInterval } from '../hooks';
import { keyConfigs, keyBindingToNoteConfig } from '../keyConfigs';
import { ModeEnum, Note, Nullable, StepParams, StepValueEnum, NoteConfig, SelectedNote } from '../types';

const styles = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  overflowY: 'hidden'
} as const

const numSteps = 16;
const numTracks = 8;

// calculates interval given bpm
// we multiple the bpm by 4 because we want to know how much elapsed time is between each step (1 beat = 4 steps)
const calculateInterval = (bpm: number) => (1 / ((bpm * 4) / 60)) * 1000

// const synthEngine = new Tone.Synth().toDestination();
//

function isSameNote(stepParam: StepParams, noteConfig: NoteConfig, currentOctave: number): boolean {
  // octave is weird...
  // all playing notes should have there octave reduced if it changes?
  return stepParam.note === noteConfig.note
    && stepParam.isSharp === noteConfig.isSharp
    && stepParam.octave === ((noteConfig.octaveAdjustment || 0) + currentOctave)
}

function getNoteLeftMargin(i: number, note: Note) {
  if (note === "C" || note === "F") {
    return i > 0 ? 29 * 2 : 29
  }
  return 0
}

function DrumSynth() {
  const [bpm, setBpm] = React.useState<number>(80)
  const [mode, setMode] = React.useState<ModeEnum>(ModeEnum.STOPPED)
  const [currentOctave] = React.useState(4)
  const [stepPatterns, setStepPatterns] = React.useState<StepParams[][]>(
    Array(numTracks).fill(undefined).map(
      () => Array(numSteps).fill(undefined).map(() => ({
        state: StepValueEnum.OFF,
        note: "C",
      }))
    )
  )
  const [stepCounter, setStepCounter] = React.useState<number>(0)
  // const [synthEngine, setSynthEngine] = React.useState<Nullable<Tone.Synth>>(null)
  const [synthEngines, setSynthEngines] = React.useState<Nullable<Tone.Synth[]>>(null)
  const [volumeNodes, setVolumeNodes] = React.useState<Nullable<Tone.Volume[]>>(null)
  const [panNodes, setPanNodes] = React.useState<Nullable<Tone.Panner[]>>(null)
  const [currentTrack, setCurrentTrack] = React.useState(0)
  const [currentNoteSelected, setCurrentNoteSelected] = React.useState<SelectedNote>({ note: "C", octave: 4 })
  // const [engine, setEngine] = React.useState<Nullable<Sequencer>>(new Sequencer(steps, bpm))
  //console.log("rendering")


  useInterval(() => {
    setStepCounter((stepCounter + 1) % numSteps)
  }, mode === ModeEnum.PLAYING ? calculateInterval(bpm) : null)

  React.useEffect(() => {
    if (!synthEngines) {
      //console.log("loading synth engine(s)")
      let newSynthEngines = Array(numTracks).fill(0).map(() => new Tone.Synth())
      let volumeNodes: Tone.Volume[] = []
      let panNodes: Tone.Panner[] = []

      // connect the volume and pan nodes
      // mutates the volumes
      let connectedSynths = newSynthEngines.map(synthEngine => {
        let newVolumeNode = new Tone.Volume(-12)
        let newPanNode = new Tone.Panner(0)
        volumeNodes.push(newVolumeNode)
        panNodes.push(newPanNode)
        return synthEngine.chain(newVolumeNode, newPanNode, Tone.Destination)
      })

      setSynthEngines(connectedSynths.map(se => se.toDestination()))
      setVolumeNodes(volumeNodes)
      setPanNodes(panNodes)
    }
  }, [])

  function handlePlayNote(noteConfig: NoteConfig) {
    setCurrentNoteSelected({
      note: noteConfig.note,
      isSharp: noteConfig.isSharp,
      octave: currentOctave,
      octaveAdjustment: noteConfig.octaveAdjustment
    })
    if (synthEngines) {
      synthEngines[currentTrack].triggerAttackRelease(`${noteConfig.note}${noteConfig.isSharp ? '#' : ''}${currentOctave + (noteConfig.octaveAdjustment || 0)}`, '16n')
    }
  }

  function getCurrentOctave(): number {
    return currentOctave
  }

  function getCurrentTrack(): number {
    return currentTrack
  }

  function handleKeyPress(key: string): void {
    const noteConfig = keyBindingToNoteConfig[key]
    if (noteConfig) {
      setCurrentNoteSelected({
        note: noteConfig.note,
        isSharp: noteConfig.isSharp,
        octave: getCurrentOctave(),
        octaveAdjustment: noteConfig.octaveAdjustment
      })
      console.log(currentTrack, getCurrentTrack())
      if (synthEngines) {
        synthEngines[getCurrentTrack()].triggerAttackRelease(`${noteConfig.note}${noteConfig.isSharp ? '#' : ''}${getCurrentOctave() + (noteConfig.octaveAdjustment || 0)}`, '16n')
      }

    }
  }


  React.useEffect(() => {
    // set up keys
    document.addEventListener('keypress', e => handleKeyPress(e.key))
  }, [synthEngines])

  React.useEffect(() => {
    if (mode === ModeEnum.PLAYING) {
      // ?
    }

    if (mode === ModeEnum.STOPPED) {
      setStepCounter(0)
    }
  }, [mode])

  React.useEffect(() => {
    if (mode !== ModeEnum.PLAYING || !synthEngines) {
      return
    }

    stepPatterns.forEach((pat, i) => {
      if (pat[stepCounter].state === StepValueEnum.ON || pat[stepCounter].state === StepValueEnum.ACCENT) {
        let noteToTrigger = `${pat[stepCounter].note}${pat[stepCounter].isSharp ? '#' : ''}${pat[stepCounter].octave || currentOctave}`
        synthEngines[i].triggerAttackRelease(noteToTrigger, '16n')
      }
    })
    // if (steps[stepCounter] === StepValueEnum.ON) {
    //console.log(stepCounter)
    // synthEngines[0].triggerAttackRelease(["C4", "C3", "A4", "E3"][Math.floor(Math.random() * 4)], "16n")
    // }
  }, [mode, stepCounter])

  function setStep(id: number, stepValue: StepValueEnum) {
    //console.log(id, value)
    console.log(stepPatterns[currentTrack])
    let selectedNote = currentNoteSelected
    let step = stepPatterns[currentTrack][id]
    step.state = stepValue
    step.isSharp = selectedNote.isSharp
    step.octave = currentOctave + (selectedNote.octaveAdjustment || 0)
    step.note = selectedNote.note

    const newStepPatterns = [...stepPatterns]
    setStepPatterns(newStepPatterns)
  }

  function handleSetBpm(newBpm: number) {
    setBpm(Math.min(Math.max(newBpm, 0), 999))
  }

  function handleSetMode(newMode: ModeEnum) {
    // use case?
    //console.log(newMode, mode)
    if (mode === newMode) {
      return /* no op or pause*/
    }
    setMode(newMode)
    if (newMode === ModeEnum.STOPPED) {
      // reset play state
      //console.log("now stopped")
    }
    if (newMode === ModeEnum.PLAYING) {
      // play
      //console.log("now playing")
    }
  }


  function getVolume(i: number): number {
    if (!volumeNodes)
      return 0  // default to off?
    //console.log(Tone.dbToGain(volumeNodes[i].volume.value) * 127)
    return Tone.dbToGain(volumeNodes[i].volume.value) * 100
  }


  function getPan(i: number): number {
    if (!panNodes)
      return 0
    return panNodes[i].pan.value * 50
  }

  function handleSetTrackVolume(i: number, val: number) {
    if (volumeNodes) {
      volumeNodes[i].set({ volume: Tone.gainToDb(val / 100) })
      setVolumeNodes([...volumeNodes])
    }
  }

  function handleSetTrackPan(i: number, val: number) {
    if (panNodes) {
      panNodes[i].set({ pan: val / 50 })
      setPanNodes([...panNodes])
    }

  }

  return <div style={styles}>
    <div /* Row */
      id="controls"
      style={{
        display: "flex",
        flexDirection: "row",
        height: "108px",
        marginLeft: "58px",
        marginRight: "58px",
        marginTop: "37px",
        outline: "2px solid black"
      }}
    >
      <Display
        mode={mode}
        bpm={bpm}
        currentStep={stepCounter}
        currentTrack={currentTrack}
      />
      <GlobalTransport
        onUpdateBpm={handleSetBpm}
        onUpdateMode={handleSetMode}
      />
      <TrackControls />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", margin: "33px 58px" }}>
      {
        stepPatterns[currentTrack].map(({ state: d }, i) => <ActionLedButton
          key={i}
          isPressed={d === StepValueEnum.ON}
          isBacklightOn={stepCounter === i && mode == ModeEnum.PLAYING}
          onButtonPress={() => setStep(i, d === StepValueEnum.ON ? StepValueEnum.OFF : StepValueEnum.ON)}

        />
        )
      }
    </div>
    <div style={{ marginLeft: "58px", marginRight: "58px", height: "155px", display: "flex", justifyContent: "space-between" }}>
      {
        Array(numTracks).fill(null).map((_, i) => <
          TrackController
          key={i}
          onSetTrackPan={(val) => handleSetTrackPan(i, val)}
          onSetTrackVolume={(val) => handleSetTrackVolume(i, val)}
          volume={getVolume(i)}
          pan={getPan(i)}
          onSelectTrack={() => setCurrentTrack(i)}
          trackNumber={i + 1}
        />

        )
      }
    </div>
    <div style={{ display: "flex", margin: "20px 58px", height: "87px" }}>
      <div style={{ backgroundColor: "darkgray", width: "194px", marginRight: "43px" }}>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "start" }}>
          {/* black keys */}
          {
            /* TODO: reduce code dupe */
            keyConfigs.black.map((noteConfig, i) => <ActionLedButton
              key={i}
              isPressed={mode === ModeEnum.PLAYING && isSameNote(stepPatterns[currentTrack][stepCounter], noteConfig, currentOctave)}
              isBacklightOn={
                currentNoteSelected.note === noteConfig.note
                && currentNoteSelected.isSharp === noteConfig.isSharp
                && currentNoteSelected.octave === currentOctave
                && currentNoteSelected.octaveAdjustment === noteConfig.octaveAdjustment
              }
              onButtonPress={() => handlePlayNote(noteConfig)}

              // C and F are compensated to get left margins while other notes will have right margins
              styleProps={{
                marginLeft: getNoteLeftMargin(i, noteConfig.note),
                marginRight: 29

              }}
              colorOff="black"
            />)
          }
        </div>
        <div style={{ display: "flex", justifyContent: "start" }}>
          {/* white keys */}
          {
            keyConfigs.white.map((noteConfig, i) => <ActionLedButton
              key={i}
              isPressed={mode === ModeEnum.PLAYING && isSameNote(stepPatterns[currentTrack][stepCounter], noteConfig, currentOctave)}
              isBacklightOn={
                currentNoteSelected.note === noteConfig.note
                && currentNoteSelected.isSharp === noteConfig.isSharp
                && currentNoteSelected.octave === currentOctave
                && currentNoteSelected.octaveAdjustment === noteConfig.octaveAdjustment
              }
              onButtonPress={() => handlePlayNote(noteConfig)}
              styleProps={{ marginRight: 29 }}
              colorOff="beige"
            />)
          }
        </div>
      </div>
    </div>
  </div>
}

export default DrumSynth;
