const { app, server, BrowserWindow, shell } = require('electron');
const path = require('path');
const url = require('url');
const http = require('http');
const fs = require('fs');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({ width: 395, height: 800, title: "Sengi", backgroundColor: '#FFF' });


    var server = http.createServer(requestHandler).listen(9527);

    // win.loadURL("http://localhost:4200");
    win.loadURL('http://localhost:9527');
    win.setMenu(null);

    // and load the index.html of the app.
    // win.loadURL(url.format({
    //   pathname: path.join(__dirname, 'dist/index.html'),
    //   protocol: 'file:',
    //   slashes: true
    // }))

    // Open the DevTools.
    win.webContents.openDevTools()

    //open external links to browser 
    win.webContents.on('new-window', function (event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
};


function requestHandler(req, res) {
    var file = req.url == '/' ? '/index.html' : req.url,
        root = __dirname + '/dist',
        page404 = root + '/404.html';

    if (file.includes('register')) file = '/index.html';

    getFile((root + file), res, page404);
};

function getFile(filePath, res, page404) {
    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (err, contents) {
                if (!err) {
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            });
        } else {
            fs.readFile(page404, function (err, contents) {
                if (!err) {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(contents);
                } else {
                    console.dir(err);
                }
            });
        }
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and require them here.
