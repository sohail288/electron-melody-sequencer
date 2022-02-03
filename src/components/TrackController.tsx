import React from 'react'
import "./track-controller.css"

interface Props {
  onSelectTrack: () => void,
  onSetTrackPan: (val: number) => void,
  onSetTrackVolume: (val: number) => void,
  volume: number;
  pan: number;
  trackNumber: number;
  selected: boolean;
}

export default ({ trackNumber, pan, volume, selected, onSelectTrack, onSetTrackPan, onSetTrackVolume }: Props) => {
  return <div style={{
    height: "100%",
    width: "58px",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "darkgrey"
  }}>
    <div className="panControllerContainer">
      <hr className="panTrack" />
      <input type="range" className="panController" value={pan} onChange={(evt) => onSetTrackPan(parseInt(evt.target.value))} min={-100} max={100}  list="pan-tickmarks" />
      <datalist id="pan-tickmarks">
        <option value="0"></option>
      </datalist>
    </div>

    <div style={{ flexGrow: 3 }}>
      <hr className="volumeTrack" />
      <input className="volumeController" onChange={(e) => onSetTrackVolume(parseInt(e.target.value))} type="range" style={{ height: "100%", width: "90px", transform: "rotate(-90deg)translateY(-21%)translateX(9px)" }} value={volume} />
    </div>
    <button className={[`${selected ? 'selected': ''}`, "trackButton"].join(' ')} onClick={onSelectTrack}>{trackNumber}</button>
  </div>
}
