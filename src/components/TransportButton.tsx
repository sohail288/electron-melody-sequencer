import React from 'react'
import { ActionLedButtonProps } from './ActionLedButton'

interface TransportButtonProps extends ActionLedButtonProps {
}

const defaultStyle: ActionLedButtonProps["styleProps"] = {
  height: 29,
  width: 29,
}

export default (props: TransportButtonProps) => {
  const { height, width } = props.styleProps || defaultStyle;
  return <button onClick={props.onButtonPress} style={{ height, width }}>
    {props.content || null}
  </button>
}
