import _ from 'electron'
import path from 'path'
import fs from 'fs'
import { BrowserWindow, app, ipcMain as ipc } from 'electron'

type Nullable<T> = T | null;

let mainWindow: Nullable<BrowserWindow>;

const indexHtml = "index.html"
const filesToWatch = [indexHtml, "content.js"]

function createWindow() {
  mainWindow = new BrowserWindow(
    {
      width: 1030, height: 550, webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
      resizable: false
    }
  )
  mainWindow.loadFile(indexHtml)

  if (parseInt(process.env.DEBUG || "0") == 1) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('close', () => {
    mainWindow = null;
  })

};

app.whenReady().then(() => {
  createWindow()

  filesToWatch.forEach(file => {
    fs.watchFile(path.resolve(__dirname, file), () => {
      console.log(file, 'changed')
      if (mainWindow !== null) {
        mainWindow.webContents.send('reload-files')
      }
    })
  })

  app.on('activate', function() {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

ipc.on('close-main-window', function() {
  app.quit();
});

app.on('window-all-closed', () => {
  app.quit()
  // if (process.platform !== 'darwin') {
  //     app.quit()
  // }
})
