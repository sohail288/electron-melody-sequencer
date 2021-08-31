import React from 'react'
import * as Tone from 'tone'
import ActionLedButton from '../components/ActionLedButton';
import Display from '../components/Display';
import GlobalTransport from '../components/GlobalTransport';
import TrackController from '../components/TrackController';
import { ModeEnum, Nullable, StepValueEnum } from '../types';

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
      (savedCallback as {current: (...args: any) => void}).current();
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
    switch(this.steps[this.stepCounter]) {
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
  const [steps, setSteps] = React.useState<StepValueEnum[]>(
    Array(numSteps).fill(StepValueEnum.OFF)
  )
  const [stepCounter, setStepCounter] = React.useState<number>(0)
  const [synthEngine, setSynthEngine] = React.useState<Nullable<Tone.Synth>>(null)
  // const [engine, setEngine] = React.useState<Nullable<Sequencer>>(new Sequencer(steps, bpm))
  console.log("rendering")


  useInterval(() => {
    setStepCounter((stepCounter + 1) % steps.length) 
  }, mode === ModeEnum.PLAYING ? calculateInterval(bpm) : null)

  React.useEffect(() => {
    if (!synthEngine) {
      console.log("loading synth engine(s)")
      setSynthEngine(new Tone.Synth().toDestination())
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
    if (mode !== ModeEnum.PLAYING || !synthEngine) {
      return
    }

    if (steps[stepCounter] === StepValueEnum.ON) {
      console.log(stepCounter)
      synthEngine.triggerAttackRelease(["C4", "C3", "A4", "E3"][Math.floor(Math.random() * 4)], "16n") 
    }
  }, [mode, stepCounter])

  function setStep(id: number, value: StepValueEnum) {
    console.log(id, value)
    steps[id] = value
    const newSteps = [...steps]
    setSteps(newSteps)
  }

  function handleSetBpm(newBpm: number) {
    setBpm(Math.min(Math.max(newBpm, 0), 999))
  }

  function handleSetMode(newMode: ModeEnum) {
    // use case?
    console.log(newMode, mode)
    if (mode === newMode) {
      return /* no op or pause*/
    }
    setMode(newMode)
    if (newMode === ModeEnum.STOPPED) {
      // reset play state
      console.log("now stopped")
    }
    if (newMode === ModeEnum.PLAYING) {
      // play
      console.log("now playing")
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
      />
      <GlobalTransport 
        onUpdateBpm={handleSetBpm} 
        onUpdateMode={handleSetMode}
      />
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", margin: "33px 58px" }}>
      {
        steps.map((d, i) => <ActionLedButton
          key={i}
          isPressed={steps[i] === StepValueEnum.ON}
          isBacklightOn={stepCounter === i && mode == ModeEnum.PLAYING}
          onButtonPress={() => setStep(i, steps[i] === StepValueEnum.ON ? StepValueEnum.OFF : StepValueEnum.ON)}

        />
        )
      }
    </div>
    <div style={{ marginLeft: "58px", marginRight: "58px", height: "138px", display: "flex", justifyContent: "space-between"}}>
      {
        Array(numTracks).fill(null).map( (_, i) => <TrackController key={i} onSetTrackPan={(val) => console.log(val)} onSetTrackVolume={(val) => console.log(val)}/>

        )
      }
    </div>
  </div>
}

export default DrumSynth;
