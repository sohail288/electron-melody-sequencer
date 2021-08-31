import React from 'react'

interface Props {
  onSetTrackPan: (val: number) => void,
  onSetTrackVolume: (val: number) => void,
  volume: number;
  pan: number;
}

export default ({ pan, volume, onSetTrackPan, onSetTrackVolume }: Props) => {
  return <div style={{
    height: "100%",
    width: "58px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "darkgrey"
  }}>
    <input type="range" style={{ marginTop: "14px", marginBottom: "14px", flexBasis: 1 }} value={pan} onChange={(evt) => onSetTrackPan(parseInt(evt.target.value))} />
    <div style={{ flexGrow: 3 }}>

      <input onChange={(e) => onSetTrackVolume(parseInt(e.target.value))} type="range" style={{ height: "100%", width: "90px", transform: "rotate(-90deg)translateY(-21%)translateX(9px)" }} value={volume} />
    </div>
  </div>
}
