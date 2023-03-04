// const path = require('path');
// const electron = require('electron');
// const jsonfile = require('jsonfile');
// const mkdirp = require('mkdirp');
import * as path from 'path';
import * as electron from 'electron';
import * as jsonfile from 'jsonfile';
import * as mkdirp from 'mkdirp';
import { app } from 'electron';
import { screen } from 'electron';

export namespace WindowState {
  export interface Options {

    /**
    * @type {number} The height that should be returned if no file exists yet. Defaults to `600`.
    * @memberof Options
    */
    defaultHeight?: number;

    /**
    * @type {number} The width that should be returned if no file exists yet. Defaults to `800`.
    * @memberof Options
    */
    defaultWidth?: number;

    /**
    * @type {number} The id of the default screen (@see {@link Electron.Screen} and {@link Electron.Display})
    * @memberof Options
    */
    defaultDisplayId?: number;

    /**
    * @type {boolean} If true, window is in a fullscreen state.
    * @memberof Options
    */
    fullScreen?: boolean;

    /**
    * @type {string} The path where the state file should be written to. Defaults to `app.getPath('userData')`.
    * @memberof Options
    */
    path?: string;

    /**
    * @type {string} The name of file. Defaults to `window-state.json`.
    * @memberof Options
    */
    file?: string;

    /**
    * @type {boolean} Should we automatically maximize the window, if it was last closed maximized. Defaults to `true`.
    * @memberof Options
    */
    maximize?: boolean;
  }

  /**
  * Object representing the height and width of a display.
  *
  * @export
  * @type DisplayBounds
  */
  export type DisplayBounds = Electron.Rectangle;

  /**
  * Object representing the state of an individual window.
  *
  * @export
  * @interface WindowState
  */
  export interface WindowState {

    /**
    * @type {DisplayBounds} Boundaries for the screen the window is on.
    * @memberof State
    */
    displayBounds?: DisplayBounds;

    /**
    * @type {number} The id of the screen the window is on (@see {@link Electron.Screen} and {@link Electron.Display})
    * @memberof State
    */
    displayId?: number;

    /**
    * @type {number} The saved width of loaded state. `defaultWidth` if the state has not been saved yet.
    * @memberof State
    */
    width?: number;

    /**
    * @type {number} The saved height of loaded state. `defaultHeight` if the state has not been saved yet.
    * @memberof State
    */
    height?: number;

    /**
    * @type {boolean} `true` if the window state was saved while the window was in full screen mode. `undefined` if the state has not been saved yet.
    * @memberof State
    */
    isFullScreen?: boolean;

    /**
    * @type {boolean} `true` if the window state was saved while the window was maximized. `undefined` if the state has not been saved yet.
    * @memberof State
    */
    isMaximized?: boolean;

    /**
     * @type {number} The saved x coordinate of the loaded state. `undefined` if the state has not been saved yet.
     * @memberof State
     */
    x?: number;

    /**
    * @type {number} The saved y coordinate of the loaded state. `undefined` if the state has not been saved yet.
    * @memberof State
    */
    y?: number;
  }

  /**
   * The complete state information of a BrowserWindow and its optional attached DevTools child window.
   *
   * @export
   * @interface State
   */
  export interface State {

    /**
     * The state of the main {@link Electron.BrowserWindow}.
     *
     * @type {WindowState}
     * @memberof BrowserWindowState
     */
    main?: WindowState;

    /**
     * The state of the child DevTools window of the main {@link Electron.BrowserWindow}.
     * If the main window has no DevTools child window, this will be an empty object `{}`.
     *
     * @type {WindowState}
     * @memberof BrowserWindowState
     */
    devtools?: WindowState | {};
  }

  export class WindowStateKeeper {
    public state:State | null;
    public config:Options;
    public configPath:string;
    public configFile:string;
    public fullStoreFileName:string;
    public winRef:Electron.BrowserWindow | null;
    public stateChangeTimer:number;
    public eventHandlingDelay:number = 100;

    constructor(options:Options) {
      const app = electron.app || electron.remote.app;
      const userDataDir = app.getPath('userData');
      const defaultFileName = "window-state.json";
      let state:State = this.createDefaultState();
      let defaultOptions:Options = this.getDefaultOptions();
      const config:Options = { ...defaultOptions, ...options };
      this.config = config;
      const configPath = config.path != null ? config.path : userDataDir;
      const configFile = config.file != null ? config.file : defaultFileName;
      const fullStoreFileName = path.join(configPath, configFile);
      this.configPath = configPath;
      this.configFile = configFile;
      this.fullStoreFileName = fullStoreFileName;
      this.state = state;
      return this;
    }

    public static getDefaultOptions():Options {
      let defaultOptions: Options = {
        file: 'window-state.json',
        path: app.getPath('userData'),
        maximize: true,
        fullScreen: true,
      };
      return defaultOptions;
    }

    public getDefaultOptions = WindowStateKeeper.getDefaultOptions;

    public getDefaultWindowState():WindowState {
      let config = this.config;
      const defaultScreen = screen.getPrimaryDisplay();
      const displayBounds = defaultScreen.bounds;
      const displayId = defaultScreen.id;
      let windowState:WindowState = {
        width: config.defaultWidth || 800,
        height: config.defaultHeight || 600,
        x: 0,
        y: 0,
        displayId: displayId,
        displayBounds: displayBounds,
      };
      return windowState;
    }

    public createDefaultState():State {
      let config = this.config;
      const defaultScreen = screen.getPrimaryDisplay();
      const displayBounds = defaultScreen.bounds;
      let state:State = {
        main: this.getDefaultWindowState(),
        devtools: this.getDefaultWindowState(),
      };
      return state;
    }


    public isNormal(win:Electron.BrowserWindow): boolean {
      return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
    }

    public hasBounds():boolean {
      let state = this.state != null ? this.state.main : null;
      return state != null &&
        typeof state.x === 'number' &&
        typeof state.y === 'number' &&
        typeof state.width === 'number' &&
        typeof state.height === 'number' &&
        Number.isInteger(state.x) &&
        Number.isInteger(state.y) &&
        Number.isInteger(state.width) && state.width > 0 &&
        Number.isInteger(state.height) && state.height > 0;
    }

    public resetStateToDefault():State {
      // let state = this.state;
      // let config = this.config;
      // const defaultScreen = screen.getPrimaryDisplay();
      // const displayBounds = defaultScreen.bounds;

      // Reset state to default values on the primary display
      let state = this.createDefaultState();
      this.state = state;
      return state;
    }

    public windowWithinBounds(bounds:DisplayBounds):boolean {
      let state = this.state != null ? this.state.main : this.getDefaultWindowState();
      return (
        state != null &&
        bounds != null &&
        typeof state.x === 'number' &&
        typeof state.y === 'number' &&
        typeof state.width === 'number' &&
        typeof state.height === 'number' &&
        typeof bounds.x === 'number' &&
        typeof bounds.y === 'number' &&
        typeof bounds.width === 'number' &&
        typeof bounds.height === 'number' &&
        state.x >= bounds.x &&
        state.y >= bounds.y &&
        state.x + state.width <= bounds.x + bounds.width &&
        state.y + state.height <= bounds.y + bounds.height
      );
    }

    public ensureWindowVisibleOnSomeDisplay():void {
      const visible = screen.getAllDisplays().some(display => {
        return this.windowWithinBounds(display.bounds);
      });

      if(!visible) {
        // Window is partially or fully not visible now.
        // Reset it to safe defaults.
        this.resetStateToDefault();
      }
    }

    public validateState() {
      let state = this.state != null ? this.state.main : null;
      const isValid = state != null && (this.hasBounds() || state.isMaximized || state.isFullScreen);
      if(!isValid) {
        state = null;
        return;
      }

      if(this.hasBounds() && state != null && state.displayBounds != null) {
        this.ensureWindowVisibleOnSomeDisplay();
      }
    }

    public updateState(browserWindow?:Electron.BrowserWindow):void {
      let win = browserWindow != null ? browserWindow : this.winRef;
      if(win == null) {
        return;
      }
      let state:WindowState = this.state != null && this.state.main != null ? this.state.main : this.getDefaultWindowState();
      let dstate:WindowState = this.state != null && this.state.devtools != null ? this.state.devtools : this.getDefaultWindowState();
      // Don't throw an error when window was closed
      try {
        const winBounds = win.getBounds();
        if(this.isNormal(win)) {
          state.x = winBounds.x;
          state.y = winBounds.y;
          state.width = winBounds.width;
          state.height = winBounds.height;
        }
        state.isMaximized = win.isMaximized();
        state.isFullScreen = win.isFullScreen();
        state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
        this.state = {
          main: state,
          devtools: dstate,
        };
      } catch (err) { }
    }

    public stateChangeHandler() {
      // Handles both 'resize' and 'move'
      clearTimeout(this.stateChangeTimer);
      this.stateChangeTimer = setTimeout(this.updateState.bind(this), this.eventHandlingDelay);
    }

    public closeHandler() {
      this.updateState();
    }

    public closedHandler() {
      // Unregister listeners and save state
      this.unmanage();
      this.saveState();
    }

    /**
    * Register listeners on the given {@link Electron.BrowserWindow} for events that are related to size or position changes (resize, move).
    * It will also restore the window's maximized or full screen state.
    * When the window is closed we automatically remove the listeners and save the state.
    *
    * @param {Electron.BrowserWindow} window The Electron BrowserWindow to begin managing the state of.
    * @memberof WindowState
    */
    public manage(browserWindow:Electron.BrowserWindow) {
      let win = browserWindow != null ? browserWindow : this.winRef;
      let config = this.config;
      let state = this.state != null && this.state.main != null ? this.state.main : null;
      if(win != null && state != null) {
        if(config.maximize && state.isMaximized) {
          win.maximize();
        }
        if(config.fullScreen && state.isFullScreen) {
          win.setFullScreen(true);
        }
        win.on('resize', this.stateChangeHandler.bind(this));
        win.on('move', this.stateChangeHandler.bind(this));
        win.on('close', this.closeHandler.bind(this));
        win.on('closed', this.closedHandler.bind(this));
        this.winRef = win;
      }
    }

    /**
    * Immediately saves the state of the provided {@link Electron.BrowserWindow}. Normally state is saved when the window closes.
    * This exists mostly for legacy purposes, and in most cases it's better to just use {@link State.manage()}.
    *
    * @param {Electron.BrowserWindow} window An Electron BrowserWindow to immediately save the state of.
    * @memberof WindowState
    */
    public saveState(browserWindow?:Electron.BrowserWindow) {
      let win = browserWindow != null ? browserWindow : this.winRef;
      // Update window state only if it was provided
      if(win != null) {
        this.updateState(win);
      }

      // Save state
      try {
        mkdirp.sync(path.dirname(this.fullStoreFileName));
        jsonfile.writeFileSync(this.fullStoreFileName, this.state);
      } catch (err) {
        // Don't care
      }
    }

    /**
    * Removes all listeners of the managed {@link Electron.BrowserWindow} in case it does not need to be managed anymore.
    *
    *
    * @param {Electron.BrowserWindow} window An Electron BrowserWindow to immediately save the state of.
    * @memberof WindowState
    */
    public unmanage() {
      let winRef = this.winRef;
      if(winRef != null) {
        winRef.removeListener('resize', this.stateChangeHandler.bind(this));
        winRef.removeListener('move', this.stateChangeHandler.bind(this));
        clearTimeout(this.stateChangeTimer);
        winRef.removeListener('close', this.closeHandler.bind(this));
        winRef.removeListener('closed', this.closedHandler.bind(this));
        winRef = null;
      }
    }

    // // Load previous state
    // try {
    //   state = jsonfile.readFileSync(fullStoreFileName);
    // } catch (err) {
    //   // Don't care
    // }

    // // Check state validity
    // validateState();

    // // Set state fallback values
    // state = Object.assign({
    //   width: config.defaultWidth || 800,
    //   height: config.defaultHeight || 600
    // }, state);

    // return {
    //   get x() { return state.x; },
    //   get y() { return state.y; },
    //   get width() { return state.width; },
    //   get height() { return state.height; },
    //   get displayBounds() { return state.displayBounds; },
    //   get isMaximized() { return state.isMaximized; },
    //   get isFullScreen() { return state.isFullScreen; },
    //   saveState,
    //   unmanage,
    //   manage,
    //   resetStateToDefault
    // };
  }
}



// declare function windowStateKeeper(opts: windowStateKeeper.Options): windowStateKeeper.State;

// export const mainWindowState = function (options: windowStateKeeper.Options) {
//   const app = electron.app || electron.remote.app;
//   const screen = electron.screen || electron.remote.screen;
//   let state: windowStateKeeper.State;
//   let winRef: Electron.BrowserWindow;
//   let stateChangeTimer: number;
//   const eventHandlingDelay = 100;
//   let defaultOptions: windowStateKeeper.Options = {
//     file: 'window-state.json',
//     path: app.getPath('userData'),
//     maximize: true,
//     fullScreen: true,
//   };
//   const config: windowStateKeeper.Options = { ...defaultOptions, ...options };
//   const configPath = config.path != null ? config.path : "";
//   const configFile = config.file != null ? config.file : "";
//   const fullStoreFileName = path.join(configPath, configFile);

// //   function isNormal(win: Electron.BrowserWindow): boolean {
// //     return !win.isMaximized() && !win.isMinimized() && !win.isFullScreen();
// //   }

// //   function hasBounds(): boolean {
// //     return state != null &&
// //       typeof state.x === 'number' &&
// //       typeof state.y === 'number' &&
// //       typeof state.width === 'number' &&
// //       typeof state.height === 'number' &&
// //       Number.isInteger(state.x) &&
// //       Number.isInteger(state.y) &&
// //       Number.isInteger(state.width) && state.width > 0 &&
// //       Number.isInteger(state.height) && state.height > 0;
// //   }

// //   function resetStateToDefault(): void {
// //     const defaultScreen = screen.getPrimaryDisplay();
// //     const displayBounds = defaultScreen.bounds;

// //     // Reset state to default values on the primary display
// //     state = {
// //       width: config.defaultWidth || 800,
// //       height: config.defaultHeight || 600,
// //       x: 0,
// //       y: 0,
// //       displayBounds
// //     };
// //   }

// //   function windowWithinBounds(bounds: windowStateKeeper.DisplayBounds): boolean {
// //     return (
// //       state != null &&
// //       bounds != null &&
// //       typeof state.x === 'number' &&
// //       typeof state.y === 'number' &&
// //       typeof state.width === 'number' &&
// //       typeof state.height === 'number' &&
// //       typeof bounds.x === 'number' &&
// //       typeof bounds.y === 'number' &&
// //       typeof bounds.width === 'number' &&
// //       typeof bounds.height === 'number' &&
// //       state.x >= bounds.x &&
// //       state.y >= bounds.y &&
// //       state.x + state.width <= bounds.x + bounds.width &&
// //       state.y + state.height <= bounds.y + bounds.height
// //     );
// //   }

// //   function ensureWindowVisibleOnSomeDisplay() {
// //     const visible = screen.getAllDisplays().some(display => {
// //       return windowWithinBounds(display.bounds);
// //     });

// //     if (!visible) {
// //       // Window is partially or fully not visible now.
// //       // Reset it to safe defaults.
// //       return resetStateToDefault();
// //     }
// //   }

// //   function validateState() {
// //     const isValid = state && (hasBounds() || state.isMaximized || state.isFullScreen);
// //     if (!isValid) {
// //       state = null;
// //       return;
// //     }

// //     if (hasBounds() && state.displayBounds) {
// //       ensureWindowVisibleOnSomeDisplay();
// //     }
// //   }

// //   function updateState(win) {
// //     win = win || winRef;
// //     if (!win) {
// //       return;
// //     }
// //     // Don't throw an error when window was closed
// //     try {
// //       const winBounds = win.getBounds();
// //       if (isNormal(win)) {
// //         state.x = winBounds.x;
// //         state.y = winBounds.y;
// //         state.width = winBounds.width;
// //         state.height = winBounds.height;
// //       }
// //       state.isMaximized = win.isMaximized();
// //       state.isFullScreen = win.isFullScreen();
// //       state.displayBounds = screen.getDisplayMatching(winBounds).bounds;
// //     } catch (err) { }
// //   }

// //   function saveState(win) {
// //     // Update window state only if it was provided
// //     if (win) {
// //       updateState(win);
// //     }

// //     // Save state
// //     try {
// //       mkdirp.sync(path.dirname(fullStoreFileName));
// //       jsonfile.writeFileSync(fullStoreFileName, state);
// //     } catch (err) {
// //       // Don't care
// //     }
// //   }

// //   function stateChangeHandler() {
// //     // Handles both 'resize' and 'move'
// //     clearTimeout(stateChangeTimer);
// //     stateChangeTimer = setTimeout(updateState, eventHandlingDelay);
// //   }

// //   function closeHandler() {
// //     updateState();
// //   }

// //   function closedHandler() {
// //     // Unregister listeners and save state
// //     unmanage();
// //     saveState();
// //   }

// //   function manage(win) {
// //     if (config.maximize && state.isMaximized) {
// //       win.maximize();
// //     }
// //     if (config.fullScreen && state.isFullScreen) {
// //       win.setFullScreen(true);
// //     }
// //     win.on('resize', stateChangeHandler);
// //     win.on('move', stateChangeHandler);
// //     win.on('close', closeHandler);
// //     win.on('closed', closedHandler);
// //     winRef = win;
// //   }

// //   function unmanage() {
// //     if (winRef) {
// //       winRef.removeListener('resize', stateChangeHandler);
// //       winRef.removeListener('move', stateChangeHandler);
// //       clearTimeout(stateChangeTimer);
// //       winRef.removeListener('close', closeHandler);
// //       winRef.removeListener('closed', closedHandler);
// //       winRef = null;
// //     }
// //   }

// //   // Load previous state
// //   try {
// //     state = jsonfile.readFileSync(fullStoreFileName);
// //   } catch (err) {
// //     // Don't care
// //   }

// //   // Check state validity
// //   validateState();

// //   // Set state fallback values
// //   state = Object.assign({
// //     width: config.defaultWidth || 800,
// //     height: config.defaultHeight || 600
// //   }, state);

// //   return {
// //     get x() { return state.x; },
// //     get y() { return state.y; },
// //     get width() { return state.width; },
// //     get height() { return state.height; },
// //     get displayBounds() { return state.displayBounds; },
// //     get isMaximized() { return state.isMaximized; },
// //     get isFullScreen() { return state.isFullScreen; },
// //     saveState,
// //     unmanage,
// //     manage,
// //     resetStateToDefault
// //   };
// // };
