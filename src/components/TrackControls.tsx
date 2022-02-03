import React from 'react'

interface Props {
  onChangeFrequency: (val: number) => void;
  frequency: number;
  onChangeTune: (val: number) => void;
  tune: number;
}

export default (props: Props) => {
  return <div style={{
    marginLeft: "29px",
    backgroundColor: 'grey',
    display: "flex",
    width: '448px',
    padding: "5px"
  }}>

    <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between", textAlign: "center" }}>
      <div>
        <div>Frequency</div>
        <input type="range"  onChange={(evt) => props.onChangeFrequency(+evt.target.value)}/>
      </div>
      <div>
        <div>Tune</div>
        <input type="range" onChange={(evt) => props.onChangeTune(+evt.target.value)}/>
      </div>
    </div>
  </div>
}
