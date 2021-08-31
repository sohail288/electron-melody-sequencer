import React from 'react'

export interface ActionLedButtonProps {
  isPressed: boolean;
  onButtonPress: () => void;
  isBacklightOn: boolean;
  styleProps?: {
    height: number;
    width: number;
  },
  content?: React.ReactHTMLElement<HTMLElement> | JSX.Element
}

const defaultStyle: ActionLedButtonProps["styleProps"] = {
  height: 29,
  width: 29,
}

export default (props: ActionLedButtonProps) => {
  const { height, width } = props.styleProps || defaultStyle
  return <button onClick={props.onButtonPress} style={{ height, width , backgroundColor: props.isBacklightOn ? "orange" : "grey" }}>
    <div style={{ height: "50%", borderRadius: "50%", left: "-25%", backgroundColor: props.isPressed ? "red": "white"}}>
    </div>
  </button>
}
