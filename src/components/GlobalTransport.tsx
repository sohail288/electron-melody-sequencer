import React from 'react'
import { ModeEnum } from '../types'
import TransportButton from './TransportButton'

interface Props {
  onUpdateBpm: (newBpm: number) => void,
  onUpdateMode: (newMode: ModeEnum) => void,
}

export default (props: Props) => {
  return <div style={
    {
      width: "182px",
      margin: "5px 0px",
      outline: "2px solid black",
      backgroundColor: "#757575",
      display: "flex",
      flexDirection: "column",
    }
  }>
    <div style={{ height: "50%" }}></div>
    <hr style={{ width: "50%" }} />
    <div style={{ height: "50%", display: "flex", justifyContent: "space-evenly", alignItems: "center" }}>
      <TransportButton isPressed={false} isBacklightOn={false} onButtonPress={() => props.onUpdateMode(ModeEnum.PLAYING)} content={<span>p</span>} />

      <TransportButton isPressed={false} isBacklightOn={false} onButtonPress={() => props.onUpdateMode(ModeEnum.STOPPED)} content={<span>s</span>}/>
    </div>
  </div>
}
