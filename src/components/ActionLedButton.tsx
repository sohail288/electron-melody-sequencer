import React from 'react'

export interface ActionLedButtonProps {
  isPressed: boolean;
  onButtonPress: () => void;
  isBacklightOn: boolean;
  styleProps?: {
    height?: number;
    width?: number;
    marginRight?: number;
    marginLeft?: number;
  },
  colorOn?: string;
  colorOff?: string;
  content?: React.ReactHTMLElement<HTMLElement> | JSX.Element
}

const defaultProps: Partial<ActionLedButtonProps> = {
  colorOff: 'grey',
  colorOn: 'orange'
}
const defaultStyle: ActionLedButtonProps["styleProps"] = {
  height: 29,
  width: 29,
  marginRight: 0,
  marginLeft: 0,
}

export default (props: ActionLedButtonProps) => {
  props = { ...defaultProps, ...props }
  const { height, width, marginRight, marginLeft } = { ...defaultStyle, ...(props.styleProps || {}) }
  return <button onClick={props.onButtonPress} style={{ height, width, backgroundColor: props.isBacklightOn ? props.colorOn : props.colorOff, marginRight, marginLeft }}>
    <div style={{ height: "50%", borderRadius: "50%", left: "-25%", backgroundColor: props.isPressed ? "red" : "white" }}>
    </div>
  </button>
}
