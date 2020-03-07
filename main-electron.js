const { app, Menu, BrowserWindow, shell } = require("electron"); 

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 377,
        height: 800,
        title: "Sengi",
        backgroundColor: "#131925",
        useContentSize: true,
        // webPreferences: {
        //     contextIsolation: true,
        //     nodeIntegration: false,
        //     nodeIntegrationInWorker: false
        //   }
    });

    win.setAutoHideMenuBar(true);
    win.setMenuBarVisibility(false);
   
    const sengiUrl = "https://sengi.nicolas-constant.com";
    win.loadURL(sengiUrl);

    const template = [
        {
            label: "View",
            submenu: [
                {
                    label: "Return on Sengi",
                    click() {
                        win.loadURL(sengiUrl);
                    }
                },
                { type: "separator" },
                { role: "reload" },
                { role: "forcereload" },
                { type: 'separator' },
                { role: 'togglefullscreen' },
                { type: "separator" },
                { role: "close" },
                { role: 'quit' }
            ]
        },
        {
            role: "help",
            submenu: [
                { role: "toggledevtools" },
                {
                    label: "Open GitHub project",
                    click() {
                        require("electron").shell.openExternal(
                            "https://github.com/NicolasConstant/sengi"
                        );
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    win.setMenu(menu);

    // Check if we are on a MAC
    if (process.platform === "darwin") {
        // Create our menu entries so that we can use MAC shortcuts
        Menu.setApplicationMenu(
            Menu.buildFromTemplate([
                {
                    label: "Sengi",
                    submenu: [                        
                        { role: "close" },
                        { role: 'quit' }
                    ]
                },
                // {
                //     label: "File",
                //     submenu: [                       
                //     ]
                // },
                {
                    label: "Edit",
                    submenu: [
                        { role: "undo" },
                        { role: "redo" },
                        { type: "separator" },
                        { role: "cut" },
                        { role: "copy" },
                        { role: "paste" },
                        { role: "pasteandmatchstyle" },
                        { role: "delete" },
                        { role: "selectall" }
                    ]
                },
                // {
                //     label: "Format",
                //     submenu: [
                //     ]
                // },
                {
                    label: "View",
                    submenu: [
                        {
                            label: "Return on Sengi",
                            click() {
                                win.loadURL(sengiUrl);
                            }
                        },
                        { type: "separator" },
                        { role: "reload" }, 
                        { role: "forcereload" },
                        { type: 'separator' },
                        { role: 'togglefullscreen' }
                    ]
                },
                // {
                //     label: "Window",
                //     submenu: [
                //     ]
                // },
                {
                    role: "Help",
                    submenu: [
                        { role: "toggledevtools" },
                        {
                            label: "Open GitHub project",
                            click() {
                                require("electron").shell.openExternal(
                                    "https://github.com/NicolasConstant/sengi"
                                );
                            }
                        }
                    ]
                }
            ])
        );
    }

    //open external links to browser
    win.webContents.on("new-window", function (event, url) {
        event.preventDefault();
        shell.openExternal(url);
    });

    // Emitted when the window is closed.
    win.on("closed", () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

app.commandLine.appendSwitch("force-color-profile", "srgb");


const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (win) {
            if (win.isMinimized()) win.restore()
            win.focus()
        }
    });

    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on("ready", createWindow);
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});