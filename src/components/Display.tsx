import React from 'react'
import { ModeEnum } from '../types'

interface Props {
  mode: ModeEnum;
  bpm: number;
  currentStep: number;
  currentTrack: number;
}

const modeDisplayMap = {
  [ModeEnum.PLAYING.valueOf()]: "playing",
  [ModeEnum.STOPPED.valueOf()]: "stopped"
}

export default (props: Props) => {
  return <div style={
    {
      width: "182px",
      margin: "5px 58px",
      outline: "2px solid black",
      background: "#c4c4c4",
      display: "flex",
      flexDirection: "column",
      padding: "2px"
    }
  }>
    <div style={{ height: "50%", textAlign: "center" }}>
      mode - track - bpm - step
    </div>
    <hr style={{ width: "50%" }} />
    <div style={{ height: "50%", textAlign: "center" }}>
      {modeDisplayMap[props.mode]} - {props.currentTrack + 1} - {props.bpm} - {props.currentStep + 1}
    </div>
  </div>
}
