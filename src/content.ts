import {ipcRenderer} from 'electron'
import * as React from "react";
import * as ReactDOM from "react-dom";


import App from "./App"

ipcRenderer.on('reload-files', () => {
    window.location = window.location
})

ReactDOM.render(React.createElement(App), document.getElementById("root"));
