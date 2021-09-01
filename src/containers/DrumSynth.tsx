import React from 'react'
import * as Tone from 'tone'
import ActionLedButton from '../components/ActionLedButton';
import Display from '../components/Display';
import GlobalTransport from '../components/GlobalTransport';
import TrackController from '../components/TrackController';
import { ModeEnum, Nullable, StepParams, StepValueEnum } from '../types';

const styles = {
  display: "flex",
  flexDirection: "column",
  height: "100%"
} as const

const numSteps = 16;
const numTracks = 8;

function useInterval(callback: (...args: any) => void, delay: Nullable<number>) {
  const savedCallback = React.useRef<(...args: any) => void>();

  // Remember the latest callback.
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  React.useEffect(() => {
    function tick() {
      (savedCallback as { current: (...args: any) => void }).current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// calculates interval given bpm
const calculateInterval = (bpm: number) => (bpm / 60 / 16) * 1000

class Sequencer {
  timer: Nullable<NodeJS.Timer>
  stepCounter: number
  bpm: number
  steps: StepValueEnum[]
  synthEngine: Tone.Synth

  constructor(steps: StepValueEnum[], bpm: number) {
    this.timer = null
    this.stepCounter = 0
    this.bpm = bpm
    this.steps = steps
    this.synthEngine = new Tone.Synth().toDestination()
  }

  handleTick() {
    switch (this.steps[this.stepCounter]) {
      case StepValueEnum.ON:
        this.synthEngine.triggerAttackRelease("C4", "16n")
    }
    this.stepCounter = (this.stepCounter + 1) % this.steps.length
  }

  updateSteps(newSteps: StepValueEnum[]) {
    this.steps = newSteps
  }

  startTick(bpm: number) {
    if (!this.timer)
      this.timer = setInterval(
        this.handleTick, calculateInterval(this.bpm)
      )
  }

  isStarted() {
    return this.timer !== null
  }

  reset() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    this.stepCounter = 0
  }

  updateBpm(bpm: number) {
    if (bpm === this.bpm)
      return
    this.bpm = bpm

    // change existing timer
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}

// const synthEngine = new Tone.Synth().toDestination();

function DrumSynth() {
  const [bpm, setBpm] = React.useState<number>(120)
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
  const [currentTrack, setCurrentTrack] = React.useState(1)
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
        synthEngines[i].triggerAttackRelease(`${pat[i].note}${currentOctave}`, "16n")
      }
    })
    // if (steps[stepCounter] === StepValueEnum.ON) {
    //console.log(stepCounter)
    // synthEngines[0].triggerAttackRelease(["C4", "C3", "A4", "E3"][Math.floor(Math.random() * 4)], "16n")
    // }
  }, [mode, stepCounter])

  function setStep(id: number, value: StepValueEnum) {
    //console.log(id, value)
    stepPatterns[currentTrack][id].state = value
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
  </div>
}

export default DrumSynth;
