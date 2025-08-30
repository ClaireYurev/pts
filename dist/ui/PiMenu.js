import { CheatFlag } from "../dev/CheatManager.js";
export class PiMenu {
    constructor(pauseManager, saveManager, settingsStore) {
        this.currentMenu = "main";
        this.resetConfirmationActive = false;
        this.resetConfirmationTimeout = null;
        this.isDevMode = false;
        this.eventListeners = [];
        this.pauseManager = pauseManager;
        this.saveManager = saveManager;
        this.settingsStore = settingsStore;
        this.abortController = new AbortController();
        this.createOverlay();
        this.createPiButton();
        this.createMainMenu();
        this.createSaveMenu();
        this.createLibraryMenu();
        this.createSettingsMenu();
        this.setupKeyboardShortcuts();
    }
    setDevTools(cheatManager, freeCamera, debugOverlay, engine) {
        this.cheatManager = cheatManager;
        this.freeCamera = freeCamera;
        this.debugOverlay = debugOverlay;
        this.engine = engine;
        this.createDevMenu();
    }
    setSaveSystem(saveSystem) {
        this.saveSystem = saveSystem;
    }
    setLibraryManager(libraryManager) {
        this.libraryManager = libraryManager;
        this.updateLibraryDisplay();
    }
    async updateLibraryDisplay() {
        if (!this.libraryManager)
            return;
        try {
            const allPacks = await this.libraryManager.getAllPacks();
            // Update built-in packs
            const builtinPacks = allPacks.filter(item => item.isBuiltIn);
            this.updatePacksList('builtinPacksList', builtinPacks);
            // Update installed packs
            const installedPacks = allPacks.filter(item => !item.isBuiltIn && item.isInstalled);
            this.updatePacksList('installedPacksList', installedPacks);
            // Update local packs (URL and file packs)
            const localPacks = allPacks.filter(item => !item.isBuiltIn && !item.isInstalled);
            this.updatePacksList('localPacksList', localPacks);
        }
        catch (error) {
            console.error('Failed to update library display:', error);
        }
    }
    updatePacksList(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container)
            return;
        if (items.length === 0) {
            container.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">No packs available</div>';
            return;
        }
        container.innerHTML = items.map(item => this.createPackElement(item)).join('');
    }
    createPackElement(item) {
        const pack = item.pack;
        const thumbnail = pack.thumbnail || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA%2BIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW1wdHk8L3RleHQ+PC9zdmc+';
        return `
            <div class="pack-item" data-pack-id="${pack.id}">
                <div class="pack-thumbnail">
                    <img src="${thumbnail}" alt="${pack.name}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px;">
                </div>
                <div class="pack-info">
                    <div class="pack-title">${pack.name}</div>
                    <div class="pack-description">${pack.description}</div>
                    <div class="pack-meta">
                        <span class="pack-author">by ${pack.author}</span>
                        <span class="pack-version">v${pack.version}</span>
                    </div>
                </div>
                <div class="pack-actions">
                    <button class="pack-play-btn" data-pack-id="${pack.id}">Play</button>
                    ${item.canInstall ? `<button class="pack-install-btn" data-pack-id="${pack.id}">Install</button>` : ''}
                    ${!item.isBuiltIn ? `<button class="pack-remove-btn" data-pack-id="${pack.id}">Remove</button>` : ''}
                </div>
            </div>
        `;
    }
    createOverlay() {
        this.overlay = document.createElement("div");
        this.overlay.id = "piMenuOverlay";
        this.overlay.style.position = "fixed";
        this.overlay.style.top = "0";
        this.overlay.style.left = "0";
        this.overlay.style.width = "100%";
        this.overlay.style.height = "100%";
        this.overlay.style.backgroundColor = "rgba(0,0,0,0.75)";
        this.overlay.style.display = "none";
        this.overlay.style.zIndex = "1000";
        this.overlay.style.fontFamily = "Arial, sans-serif";
        this.overlay.style.color = "#FFF";
        this.overlay.style.padding = "20px";
        this.overlay.style.boxSizing = "border-box";
        // Close menu when clicking outside
        const overlayClickHandler = (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        };
        this.overlay.addEventListener('click', overlayClickHandler, { signal: this.abortController.signal });
        this.eventListeners.push({ element: this.overlay, type: 'click', listener: overlayClickHandler });
        document.body.appendChild(this.overlay);
    }
    createPiButton() {
        const piButton = document.createElement("button");
        piButton.id = "piMenuButton";
        piButton.textContent = "π";
        piButton.title = "Menu";
        piButton.setAttribute("aria-label", "Open game menu");
        piButton.style.position = "fixed";
        piButton.style.bottom = "20px";
        piButton.style.right = "20px";
        piButton.style.border = "none";
        piButton.style.backgroundColor = "transparent";
        piButton.style.color = "rgba(255,255,255,0.8)";
        piButton.style.fontSize = "32px";
        piButton.style.fontFamily = "'Times New Roman', serif";
        piButton.style.fontWeight = "normal";
        piButton.style.cursor = "pointer";
        piButton.style.zIndex = "9999";
        piButton.style.padding = "0";
        piButton.style.margin = "0";
        piButton.style.outline = "none";
        piButton.style.transition = "color 0.2s ease";
        // Add hover effect
        const mouseEnterHandler = () => {
            piButton.style.color = "rgba(255,255,255,1)";
        };
        const mouseLeaveHandler = () => {
            piButton.style.color = "rgba(255,255,255,0.8)";
        };
        const clickHandler = () => this.toggle();
        piButton.addEventListener('mouseenter', mouseEnterHandler, { signal: this.abortController.signal });
        piButton.addEventListener('mouseleave', mouseLeaveHandler, { signal: this.abortController.signal });
        piButton.addEventListener('click', clickHandler, { signal: this.abortController.signal });
        this.eventListeners.push({ element: piButton, type: 'mouseenter', listener: mouseEnterHandler }, { element: piButton, type: 'mouseleave', listener: mouseLeaveHandler }, { element: piButton, type: 'click', listener: clickHandler });
        document.body.appendChild(piButton);
    }
    createMainMenu() {
        const mainMenu = document.createElement("div");
        mainMenu.id = "mainMenu";
        mainMenu.style.textAlign = "center";
        mainMenu.style.maxWidth = "400px";
        mainMenu.style.margin = "50px auto";
        mainMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        mainMenu.style.padding = "20px";
        mainMenu.style.borderRadius = "10px";
        mainMenu.style.border = "2px solid #666";
        mainMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">π Menu</h2>
            <button id="resumeBtn" class="menu-btn">Resume Game</button>
            <button id="settingsBtn" class="menu-btn">Settings</button>
            <button id="saveBtn" class="menu-btn">Save/Load</button>
            <button id="libraryBtn" class="menu-btn">Game Library</button>
            <button id="shareBtn" class="menu-btn" style="background-color: #0066cc; border-color: #0099ff;">Copy Boot Link</button>
            <button id="resetBtn" class="menu-btn" style="background-color: #8B0000; border-color: #DC143C;">Reset Game</button>
            <button id="quitBtn" class="menu-btn">Quit Game</button>
        `;
        this.overlay.appendChild(mainMenu);
        this.setupMainMenuEvents();
    }
    createSaveMenu() {
        const saveMenu = document.createElement("div");
        saveMenu.id = "saveMenu";
        saveMenu.style.display = "none";
        saveMenu.style.textAlign = "center";
        saveMenu.style.maxWidth = "800px";
        saveMenu.style.margin = "20px auto";
        saveMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        saveMenu.style.padding = "20px";
        saveMenu.style.borderRadius = "10px";
        saveMenu.style.border = "2px solid #666";
        saveMenu.style.maxHeight = "80vh";
        saveMenu.style.overflowY = "auto";
        saveMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">Save/Load Game</h2>
            <div id="saveSlotsContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0;">
                <div class="save-slot-tile" data-slot="1">
                    <div class="save-thumbnail">
                        <img id="slot1Thumbnail" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA%2BIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW1wdHk8L3RleHQ+PC9zdmc+" alt="Empty Slot" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px;">
                    </div>
                    <div class="save-info">
                        <div class="save-title">Slot 1</div>
                        <div id="slot1Status" class="save-status">Empty</div>
                        <div id="slot1Time" class="save-time"></div>
                    </div>
                    <div class="save-actions">
                        <button class="save-action-btn save-btn" data-slot="1">Save</button>
                        <button class="save-action-btn load-btn" data-slot="1" style="display: none;">Load</button>
                        <button class="save-action-btn overwrite-btn" data-slot="1" style="display: none;">Overwrite</button>
                    </div>
                </div>
                
                <div class="save-slot-tile" data-slot="2">
                    <div class="save-thumbnail">
                        <img id="slot2Thumbnail" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA%2BIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW1wdHk8L3RleHQ+PC9zdmc+" alt="Empty Slot" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px;">
                    </div>
                    <div class="save-info">
                        <div class="save-title">Slot 2</div>
                        <div id="slot2Status" class="save-status">Empty</div>
                        <div id="slot2Time" class="save-time"></div>
                    </div>
                    <div class="save-actions">
                        <button class="save-action-btn save-btn" data-slot="2">Save</button>
                        <button class="save-action-btn load-btn" data-slot="2" style="display: none;">Load</button>
                        <button class="save-action-btn overwrite-btn" data-slot="2" style="display: none;">Overwrite</button>
                    </div>
                </div>
                
                <div class="save-slot-tile" data-slot="3">
                    <div class="save-thumbnail">
                        <img id="slot3Thumbnail" src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA%2BIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW1wdHk8L3RleHQ+PC9zdmc+" alt="Empty Slot" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px;">
                    </div>
                    <div class="save-info">
                        <div class="save-title">Slot 3</div>
                        <div id="slot3Status" class="save-status">Empty</div>
                        <div id="slot3Time" class="save-time"></div>
                    </div>
                    <div class="save-actions">
                        <button class="save-action-btn save-btn" data-slot="3">Save</button>
                        <button class="save-action-btn load-btn" data-slot="3" style="display: none;">Load</button>
                        <button class="save-action-btn overwrite-btn" data-slot="3" style="display: none;">Overwrite</button>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <button id="backFromSaveBtn" class="menu-btn">Back</button>
            </div>
        `;
        this.overlay.appendChild(saveMenu);
        this.setupSaveMenuEvents();
    }
    createLibraryMenu() {
        const libraryMenu = document.createElement("div");
        libraryMenu.id = "libraryMenu";
        libraryMenu.style.display = "none";
        libraryMenu.style.textAlign = "center";
        libraryMenu.style.maxWidth = "900px";
        libraryMenu.style.margin = "20px auto";
        libraryMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        libraryMenu.style.padding = "20px";
        libraryMenu.style.borderRadius = "10px";
        libraryMenu.style.border = "2px solid #666";
        libraryMenu.style.maxHeight = "80vh";
        libraryMenu.style.overflowY = "auto";
        libraryMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">Game Library</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center;">
                <button id="libraryTabBuiltin" class="library-tab-btn active">Built-in</button>
                <button id="libraryTabInstalled" class="library-tab-btn">Installed</button>
                <button id="libraryTabLocal" class="library-tab-btn">Local</button>
            </div>
            
            <div id="libraryContent">
                <div id="builtinPanel" class="library-panel active">
                    <div id="builtinPacksList" class="packs-grid">
                        <!-- Built-in packs will be loaded here -->
                    </div>
                </div>
                
                <div id="installedPanel" class="library-panel">
                    <div id="installedPacksList" class="packs-grid">
                        <!-- Installed packs will be loaded here -->
                    </div>
                </div>
                
                <div id="localPanel" class="library-panel">
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: #CCC; margin-bottom: 15px;">Load a .ptspack.json file from your computer</p>
                        <input type="file" id="localFileInput" accept=".ptspack.json" style="display: none;">
                        <button id="selectLocalFileBtn" class="menu-btn">Select File</button>
                    </div>
                    <div id="localPacksList" class="packs-grid">
                        <!-- Local packs will be shown here -->
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #666;">
                <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 10px;">
                    <button id="loadFromUrlBtn" class="menu-btn" style="background-color: #0066cc; border-color: #0099ff;">Load from URL</button>
                    <button id="clearCacheBtn" class="menu-btn" style="background-color: #8B0000; border-color: #DC143C;">Clear Cache</button>
                </div>
                <button id="backFromLibraryBtn" class="menu-btn">Back</button>
            </div>
        `;
        this.overlay.appendChild(libraryMenu);
        this.setupLibraryMenuEvents();
    }
    createSettingsMenu() {
        const settingsMenu = document.createElement("div");
        settingsMenu.id = "settingsMenu";
        settingsMenu.style.display = "none";
        settingsMenu.style.textAlign = "center";
        settingsMenu.style.maxWidth = "600px";
        settingsMenu.style.margin = "20px auto";
        settingsMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        settingsMenu.style.padding = "20px";
        settingsMenu.style.borderRadius = "10px";
        settingsMenu.style.border = "2px solid #666";
        settingsMenu.style.maxHeight = "80vh";
        settingsMenu.style.overflowY = "auto";
        settingsMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">Settings</h2>
            
            <div style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center;">
                <button id="settingsTabControls" class="settings-tab-btn active">Controls</button>
                <button id="settingsTabVideo" class="settings-tab-btn">Video</button>
                <button id="settingsTabAudio" class="settings-tab-btn">Audio</button>
                <button id="settingsTabAccessibility" class="settings-tab-btn">Accessibility</button>
            </div>
            
            <div id="settingsContent">
                <div id="controlsPanel" class="settings-panel active">
                    <h3 style="color: #FFF; margin-top: 0;">Controls</h3>
                    
                    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                        <button id="controlsTabKeyboard" class="controls-tab-btn active">Keyboard</button>
                        <button id="controlsTabGamepad" class="controls-tab-btn">Gamepad</button>
                        <button id="controlsTabAccessibility" class="controls-tab-btn">Accessibility</button>
                    </div>
                    
                    <div id="keyboardControls" class="controls-panel active">
                        <h4 style="color: #FFF; margin-top: 0;">Keyboard Bindings</h4>
                        
                        <div style="margin-bottom: 15px; text-align: center;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Preset Configuration:</label>
                            <select id="keyboardPreset" style="width: 150px; padding: 8px; background: #333; color: #FFF; border: 1px solid #666; border-radius: 4px;">
                                <option value="custom">Custom</option>
                                <option value="classic">Classic (Arrow Keys)</option>
                                <option value="wasd">WASD</option>
                            </select>
                        </div>
                        
                        <div style="text-align: left; color: #CCC;">
                            <div class="binding-row">
                                <span class="binding-label">Move Left:</span>
                                <button class="binding-btn" data-action="Left" data-device="keyboard">A</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Right:</span>
                                <button class="binding-btn" data-action="Right" data-device="keyboard">D</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Up:</span>
                                <button class="binding-btn" data-action="Up" data-device="keyboard">W</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Down:</span>
                                <button class="binding-btn" data-action="Down" data-device="keyboard">S</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Jump:</span>
                                <button class="binding-btn" data-action="Jump" data-device="keyboard">Space</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Action:</span>
                                <button class="binding-btn" data-action="Action" data-device="keyboard">E</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Block:</span>
                                <button class="binding-btn" data-action="Block" data-device="keyboard">Q</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Pause:</span>
                                <button class="binding-btn" data-action="Pause" data-device="keyboard">Escape</button>
                            </div>
                        </div>
                        <div style="margin-top: 15px;">
                            <button id="resetKeyboardBtn" class="menu-btn" style="background-color: #666;">Reset to Defaults</button>
                        </div>
                    </div>
                    
                    <div id="gamepadControls" class="controls-panel">
                        <h4 style="color: #FFF; margin-top: 0;">Gamepad Settings</h4>
                        <div style="text-align: left; color: #CCC;">
                            <div class="binding-row">
                                <span class="binding-label">Deadzone:</span>
                                <input type="range" id="gamepadDeadzone" min="0" max="50" value="15" style="width: 150px;">
                                <span id="deadzoneValue">15%</span>
                            </div>
                            <div id="gamepadStatus" style="margin: 10px 0; padding: 10px; background: #333; border-radius: 4px;">
                                <strong>Gamepad Status:</strong> <span id="gamepadConnected">Not Connected</span>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Left:</span>
                                <button class="binding-btn" data-action="Left" data-device="gamepad">DPad Left</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Right:</span>
                                <button class="binding-btn" data-action="Right" data-device="gamepad">DPad Right</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Up:</span>
                                <button class="binding-btn" data-action="Up" data-device="gamepad">DPad Up</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Move Down:</span>
                                <button class="binding-btn" data-action="Down" data-device="gamepad">DPad Down</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Jump:</span>
                                <button class="binding-btn" data-action="Jump" data-device="gamepad">A Button</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Action:</span>
                                <button class="binding-btn" data-action="Action" data-device="gamepad">B Button</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Block:</span>
                                <button class="binding-btn" data-action="Block" data-device="gamepad">X Button</button>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">Pause:</span>
                                <button class="binding-btn" data-action="Pause" data-device="gamepad">Start</button>
                            </div>
                        </div>
                        <div style="margin-top: 15px;">
                            <button id="resetGamepadBtn" class="menu-btn" style="background-color: #666;">Reset to Defaults</button>
                        </div>
                    </div>
                    
                    <div id="accessibilityControls" class="controls-panel">
                        <h4 style="color: #FFF; margin-top: 0;">Accessibility Settings</h4>
                        <div style="text-align: left; color: #CCC;">
                            <div class="binding-row">
                                <span class="binding-label">Late Jump Buffer:</span>
                                <input type="range" id="lateJumpBuffer" min="0" max="200" value="80" style="width: 150px;">
                                <span id="lateJumpValue">80ms</span>
                            </div>
                            <div class="binding-row">
                                <span class="binding-label">
                                    <input type="checkbox" id="stickyGrab" style="margin-right: 8px;"> Sticky Grab
                                </span>
                            </div>
                            <div style="margin: 10px 0; padding: 10px; background: #333; border-radius: 4px; font-size: 12px;">
                                <strong>Late Jump Buffer:</strong> If you press Jump within this time before landing, it will execute the jump automatically.<br>
                                <strong>Sticky Grab:</strong> While holding Action, you'll automatically grab ledges when near them.
                            </div>
                        </div>
                    </div>
                    
                    <div id="rebindingOverlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                        <div style="background: #333; padding: 30px; border-radius: 10px; text-align: center; color: #FFF;">
                            <h3>Press any key or button...</h3>
                            <p id="rebindingAction">Rebinding: <span id="rebindingActionName"></span></p>
                            <button id="cancelRebindBtn" class="menu-btn" style="background-color: #666;">Cancel</button>
                        </div>
                    </div>
                </div>
                
                <div id="videoPanel" class="settings-panel">
                    <h3 style="color: #FFF; margin-top: 0;">Video</h3>
                    <div style="text-align: left;">
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Scale Mode:</label>
                            <select id="videoScaleMode" style="width: 100%; padding: 8px; background: #333; color: #FFF; border: 1px solid #666; border-radius: 4px;">
                                <option value="integer">Integer Scale</option>
                                <option value="fit">Fit Screen</option>
                                <option value="stretch">Stretch</option>
                            </select>
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="videoFullscreen" style="margin-right: 8px;"> Fullscreen
                            </label>
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Safe Area: <span id="safeAreaValue">3%</span></label>
                            <input type="range" id="safeAreaSlider" min="0" max="10" value="3" style="width: 100%;">
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">FPS Cap: <span id="fpsCapValue">60</span></label>
                            <input type="range" id="fpsCapSlider" min="30" max="120" value="60" step="30" style="width: 100%;">
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="videoVsync" style="margin-right: 8px;"> V-Sync
                            </label>
                        </div>
                    </div>
                </div>
                
                <div id="audioPanel" class="settings-panel">
                    <h3 style="color: #FFF; margin-top: 0;">Audio</h3>
                    <div style="text-align: left;">
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="audioMuted" style="margin-right: 8px;"> Mute All Audio
                            </label>
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Master Volume: <span id="masterVolumeValue">100%</span></label>
                            <input type="range" id="masterVolumeSlider" min="0" max="100" value="100" style="width: 100%;">
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Music Volume: <span id="musicVolumeValue">80%</span></label>
                            <input type="range" id="musicVolumeSlider" min="0" max="100" value="80" style="width: 100%;">
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">SFX Volume: <span id="sfxVolumeValue">100%</span></label>
                            <input type="range" id="sfxVolumeSlider" min="0" max="100" value="100" style="width: 100%;">
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Audio Latency:</label>
                            <select id="audioLatency" style="width: 100%; padding: 8px; background: #333; color: #FFF; border: 1px solid #666; border-radius: 4px;">
                                <option value="auto">Auto</option>
                                <option value="low">Low</option>
                                <option value="compat">Compatible</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div id="accessibilityPanel" class="settings-panel">
                    <h3 style="color: #FFF; margin-top: 0;">Accessibility</h3>
                    <div style="text-align: left;">
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="accessibilityHighContrast" style="margin-right: 8px;"> High Contrast Mode
                            </label>
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="accessibilityReduceFlashes" style="margin-right: 8px;"> Reduce Flashes
                            </label>
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">Late Jump Window: <span id="lateJumpValue">0ms</span></label>
                            <input type="range" id="lateJumpSlider" min="0" max="200" value="0" step="10" style="width: 100%;">
                        </div>
                        
                        <div style="margin: 10px 0;">
                            <label style="color: #CCC; display: block; margin-bottom: 5px;">
                                <input type="checkbox" id="accessibilityStickyGrab" style="margin-right: 8px;"> Sticky Grab
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <button id="settingsResetBtn" class="menu-btn" style="background-color: #8B0000; border-color: #DC143C;">Reset to Defaults</button>
                <button id="backFromSettingsBtn" class="menu-btn">Back</button>
            </div>
        `;
        this.overlay.appendChild(settingsMenu);
        this.setupSettingsMenuEvents();
    }
    createDevMenu() {
        const devMenu = document.createElement("div");
        devMenu.id = "devMenu";
        devMenu.style.display = "none";
        devMenu.style.textAlign = "center";
        devMenu.style.maxWidth = "600px";
        devMenu.style.margin = "20px auto";
        devMenu.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
        devMenu.style.padding = "20px";
        devMenu.style.borderRadius = "10px";
        devMenu.style.border = "2px solid #0f0";
        devMenu.style.fontFamily = "monospace";
        devMenu.style.fontSize = "12px";
        devMenu.style.color = "#0f0";
        devMenu.style.maxHeight = "80vh";
        devMenu.style.overflowY = "auto";
        devMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #0f0; border-bottom: 1px solid #0f0; padding-bottom: 10px;">DEV PANEL</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 5px 0; color: #ff0;">Cheats</h4>
                    <label style="display: block; margin: 2px 0;">
                        <input type="checkbox" id="devCheatGod"> God Mode
                    </label>
                    <label style="display: block; margin: 2px 0;">
                        <input type="checkbox" id="devCheatNoClip"> No Clip
                    </label>
                    <label style="display: block; margin: 2px 0;">
                        <input type="checkbox" id="devCheatInfTime"> Infinite Time
                    </label>
                    <label style="display: block; margin: 2px 0;">
                        <input type="checkbox" id="devCheatGiveSword"> Give Sword
                    </label>
                    <label style="display: block; margin: 2px 0;">
                        Set Health: <input type="number" id="devCheatHealth" value="100" min="0" max="999" style="width: 60px; background: #000; color: #0f0; border: 1px solid #0f0;">
                    </label>
                    <button id="devCheatApply" style="margin: 5px 0; background: #000; color: #0f0; border: 1px solid #0f0; padding: 3px 8px; cursor: pointer;">Apply Cheats</button>
                    <button id="devCheatReset" style="margin: 5px 0; margin-left: 5px; background: #000; color: #f00; border: 1px solid #f00; padding: 3px 8px; cursor: pointer;">Reset All</button>
                </div>

                <div>
                    <h4 style="margin: 5px 0; color: #ff0;">Debug Tools</h4>
                    <label style="display: block; margin: 2px 0;">
                        <input type="checkbox" id="devDebugOverlay"> Debug Overlay
                    </label>
                    <label style="display: block; margin: 2px 0;">
                        <input type="checkbox" id="devFreeCamera"> Free Camera
                    </label>
                    <button id="devResetCamera" style="margin: 5px 0; background: #000; color: #0f0; border: 1px solid #0f0; padding: 3px 8px; cursor: pointer;">Reset Camera</button>
                    <div style="font-size: 10px; color: #0a0; margin-top: 5px;">Free Camera: Numpad 4,8,6,2 to move, 5 to reset</div>
                </div>
            </div>

            <div style="margin-bottom: 15px;">
                <h4 style="margin: 5px 0; color: #ff0;">Active Cheats</h4>
                <div id="devActiveCheats" style="font-size: 10px; color: #0a0; background: #000; padding: 5px; border: 1px solid #0f0;"></div>
            </div>

            <button id="backFromDevBtn" class="menu-btn" style="background-color: #000; color: #0f0; border: 1px solid #0f0;">Resume Game</button>
        `;
        this.overlay.appendChild(devMenu);
        this.setupDevMenuEvents();
    }
    setupMainMenuEvents() {
        const resumeBtn = document.getElementById("resumeBtn");
        const settingsBtn = document.getElementById("settingsBtn");
        const saveBtn = document.getElementById("saveBtn");
        const libraryBtn = document.getElementById("libraryBtn");
        const shareBtn = document.getElementById("shareBtn");
        const quitBtn = document.getElementById("quitBtn");
        const resetBtn = document.getElementById("resetBtn");
        if (resumeBtn) {
            const resumeHandler = () => {
                this.pauseManager.resume();
                this.close();
            };
            resumeBtn.addEventListener('click', resumeHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: resumeBtn, type: 'click', listener: resumeHandler });
        }
        if (settingsBtn) {
            const settingsHandler = () => {
                this.showMenu("settings");
            };
            settingsBtn.addEventListener('click', settingsHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: settingsBtn, type: 'click', listener: settingsHandler });
        }
        if (saveBtn) {
            const saveHandler = () => {
                this.showMenu("save");
            };
            saveBtn.addEventListener('click', saveHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: saveBtn, type: 'click', listener: saveHandler });
        }
        if (libraryBtn) {
            const libraryHandler = () => {
                this.showMenu("library");
            };
            libraryBtn.addEventListener('click', libraryHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: libraryBtn, type: 'click', listener: libraryHandler });
        }
        if (shareBtn) {
            const shareHandler = async () => {
                if (this.engine) {
                    try {
                        const success = await this.copyShareUrl();
                        if (success) {
                            // Show success message
                            const originalText = shareBtn.textContent;
                            shareBtn.textContent = "Link Copied!";
                            shareBtn.style.backgroundColor = "#00cc00";
                            shareBtn.style.borderColor = "#00ff00";
                            setTimeout(() => {
                                shareBtn.textContent = originalText;
                                shareBtn.style.backgroundColor = "#0066cc";
                                shareBtn.style.borderColor = "#0099ff";
                            }, 2000);
                        }
                        else {
                            // Show error message
                            const originalText = shareBtn.textContent;
                            shareBtn.textContent = "Copy Failed!";
                            shareBtn.style.backgroundColor = "#cc0000";
                            shareBtn.style.borderColor = "#ff0000";
                            setTimeout(() => {
                                shareBtn.textContent = originalText;
                                shareBtn.style.backgroundColor = "#0066cc";
                                shareBtn.style.borderColor = "#0099ff";
                            }, 2000);
                        }
                    }
                    catch (error) {
                        console.error("Error copying share URL:", error);
                    }
                }
            };
            shareBtn.addEventListener('click', shareHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: shareBtn, type: 'click', listener: shareHandler });
        }
        if (quitBtn) {
            const quitHandler = () => {
                if (confirm("Are you sure you want to quit?")) {
                    window.close();
                }
            };
            quitBtn.addEventListener('click', quitHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: quitBtn, type: 'click', listener: quitHandler });
        }
        // Reset button with double-click confirmation
        if (resetBtn) {
            const resetHandler = () => {
                this.handleResetGame();
            };
            resetBtn.addEventListener('click', resetHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: resetBtn, type: 'click', listener: resetHandler });
        }
    }
    setupSaveMenuEvents() {
        // Back button
        const backFromSaveBtn = document.getElementById("backFromSaveBtn");
        if (backFromSaveBtn) {
            const backHandler = () => {
                this.showMenu("main");
            };
            backFromSaveBtn.addEventListener('click', backHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: backFromSaveBtn, type: 'click', listener: backHandler });
        }
        // Save action buttons
        document.querySelectorAll("#saveMenu .save-action-btn").forEach(btn => {
            const actionHandler = (e) => {
                e.stopPropagation();
                const slot = Number(btn.dataset.slot) - 1; // Convert to 0-based index
                const action = btn.classList.contains('save-btn') ? 'save' :
                    btn.classList.contains('load-btn') ? 'load' : 'overwrite';
                this.handleSaveAction(slot, action);
            };
            btn.addEventListener('click', actionHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: btn, type: 'click', listener: actionHandler });
        });
    }
    setupSettingsMenuEvents() {
        // Back button
        const backFromSettingsBtn = document.getElementById("backFromSettingsBtn");
        if (backFromSettingsBtn) {
            const backHandler = () => {
                this.showMenu("main");
            };
            backFromSettingsBtn.addEventListener('click', backHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: backFromSettingsBtn, type: 'click', listener: backHandler });
        }
        // Reset button
        const settingsResetBtn = document.getElementById("settingsResetBtn");
        if (settingsResetBtn) {
            const resetHandler = () => {
                if (confirm("Reset all settings to defaults?")) {
                    this.resetSettingsToDefaults();
                }
            };
            settingsResetBtn.addEventListener('click', resetHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: settingsResetBtn, type: 'click', listener: resetHandler });
        }
        // Tab buttons
        const tabButtons = [
            { id: "settingsTabControls", panel: "controlsPanel" },
            { id: "settingsTabVideo", panel: "videoPanel" },
            { id: "settingsTabAudio", panel: "audioPanel" },
            { id: "settingsTabAccessibility", panel: "accessibilityPanel" }
        ];
        tabButtons.forEach(({ id, panel }) => {
            const tabBtn = document.getElementById(id);
            if (tabBtn) {
                const tabHandler = () => {
                    this.switchSettingsTab(panel);
                };
                tabBtn.addEventListener('click', tabHandler, { signal: this.abortController.signal });
                this.eventListeners.push({ element: tabBtn, type: 'click', listener: tabHandler });
            }
        });
        // Video settings
        this.setupVideoSettingsEvents();
        // Audio settings
        this.setupAudioSettingsEvents();
        // Accessibility settings
        this.setupAccessibilitySettingsEvents();
        // Controls settings
        this.setupControlsEvents();
    }
    setupLibraryMenuEvents() {
        // Back button
        const backFromLibraryBtn = document.getElementById("backFromLibraryBtn");
        if (backFromLibraryBtn) {
            const backHandler = () => {
                this.showMenu("main");
            };
            backFromLibraryBtn.addEventListener('click', backHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: backFromLibraryBtn, type: 'click', listener: backHandler });
        }
        // Tab buttons
        const tabButtons = [
            { id: "libraryTabBuiltin", panel: "builtinPanel" },
            { id: "libraryTabInstalled", panel: "installedPanel" },
            { id: "libraryTabLocal", panel: "localPanel" }
        ];
        tabButtons.forEach(({ id, panel }) => {
            const tabBtn = document.getElementById(id);
            if (tabBtn) {
                const tabHandler = () => {
                    this.switchLibraryTab(panel);
                };
                tabBtn.addEventListener('click', tabHandler, { signal: this.abortController.signal });
                this.eventListeners.push({ element: tabBtn, type: 'click', listener: tabHandler });
            }
        });
        // Load from URL button
        const loadFromUrlBtn = document.getElementById("loadFromUrlBtn");
        if (loadFromUrlBtn) {
            const urlHandler = () => {
                this.handleLoadFromUrl();
            };
            loadFromUrlBtn.addEventListener('click', urlHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: loadFromUrlBtn, type: 'click', listener: urlHandler });
        }
        // Clear cache button
        const clearCacheBtn = document.getElementById("clearCacheBtn");
        if (clearCacheBtn) {
            const clearHandler = () => {
                this.handleClearCache();
            };
            clearCacheBtn.addEventListener('click', clearHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: clearCacheBtn, type: 'click', listener: clearHandler });
        }
        // Select local file button
        const selectLocalFileBtn = document.getElementById("selectLocalFileBtn");
        const localFileInput = document.getElementById("localFileInput");
        if (selectLocalFileBtn && localFileInput) {
            const selectHandler = () => {
                localFileInput.click();
            };
            selectLocalFileBtn.addEventListener('click', selectHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: selectLocalFileBtn, type: 'click', listener: selectHandler });
            // File input change handler
            const fileHandler = (e) => {
                const target = e.target;
                if (target.files && target.files[0]) {
                    this.handleLocalFileLoad(e);
                }
            };
            localFileInput.addEventListener('change', fileHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: localFileInput, type: 'change', listener: fileHandler });
        }
        // Pack action handlers
        this.setupPackActionHandlers();
    }
    setupPackActionHandlers() {
        // Delegate event handling for pack actions
        const libraryContent = document.getElementById('libraryContent');
        if (libraryContent) {
            const actionHandler = (e) => {
                const target = e.target;
                const packId = target.getAttribute('data-pack-id');
                if (!packId)
                    return;
                if (target.classList.contains('pack-play-btn')) {
                    this.handlePackPlay(packId);
                }
                else if (target.classList.contains('pack-install-btn')) {
                    this.handlePackInstall(packId);
                }
                else if (target.classList.contains('pack-remove-btn')) {
                    this.handlePackRemove(packId);
                }
            };
            libraryContent.addEventListener('click', actionHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: libraryContent, type: 'click', listener: actionHandler });
        }
    }
    async handlePackPlay(packId) {
        if (!this.libraryManager)
            return;
        try {
            const success = await this.libraryManager.switchPack(packId);
            if (success) {
                this.close();
                // The engine should handle the pack switch
            }
            else {
                alert('Failed to switch to pack. Please try again.');
            }
        }
        catch (error) {
            console.error('Failed to play pack:', error);
            alert('Failed to load pack. Please check the pack files.');
        }
    }
    async handlePackInstall(packId) {
        if (!this.libraryManager)
            return;
        try {
            const result = await this.libraryManager.installPack(packId);
            if (result.success) {
                alert(`Pack installed successfully! Size: ${(result.size || 0) / 1024 / 1024} MB`);
                await this.updateLibraryDisplay();
            }
            else {
                alert(`Failed to install pack: ${result.error}`);
            }
        }
        catch (error) {
            console.error('Failed to install pack:', error);
            alert('Failed to install pack. Please try again.');
        }
    }
    async handlePackRemove(packId) {
        if (!this.libraryManager)
            return;
        if (confirm('Are you sure you want to remove this pack?')) {
            try {
                await this.libraryManager.removePack(packId);
                alert('Pack removed successfully');
                this.updateLibraryDisplay();
            }
            catch (error) {
                console.error('Failed to remove pack:', error);
                alert('Failed to remove pack. Please try again.');
            }
        }
    }
    setupDevMenuEvents() {
        // Resume Game button
        const backFromDevBtn = document.getElementById("backFromDevBtn");
        if (backFromDevBtn) {
            backFromDevBtn.onclick = () => {
                this.close();
            };
        }
        // Apply cheats button
        const devCheatApply = document.getElementById("devCheatApply");
        if (devCheatApply) {
            devCheatApply.addEventListener("click", () => {
                this.applyDevCheats();
            });
        }
        // Reset cheats button
        const devCheatReset = document.getElementById("devCheatReset");
        if (devCheatReset) {
            devCheatReset.addEventListener("click", () => {
                if (this.cheatManager) {
                    this.cheatManager.reset();
                    this.updateDevActiveCheatsDisplay();
                }
            });
        }
        // Debug overlay toggle
        const devDebugOverlay = document.getElementById("devDebugOverlay");
        if (devDebugOverlay) {
            devDebugOverlay.addEventListener("change", (e) => {
                const target = e.target;
                if (this.debugOverlay) {
                    this.debugOverlay.setEnabled(target.checked);
                }
            });
        }
        // Free camera toggle
        const devFreeCamera = document.getElementById("devFreeCamera");
        if (devFreeCamera) {
            devFreeCamera.addEventListener("change", (e) => {
                const target = e.target;
                if (this.freeCamera) {
                    this.freeCamera.setEnabled(target.checked);
                    if (!target.checked && this.engine) {
                        // Reset camera to player when disabling
                        const player = this.engine.getEntities()[0];
                        if (player) {
                            this.freeCamera.setPosition(player.position.x, player.position.y);
                        }
                    }
                }
            });
        }
        // Reset camera button
        const devResetCamera = document.getElementById("devResetCamera");
        if (devResetCamera) {
            devResetCamera.addEventListener("click", () => {
                if (this.freeCamera && this.engine) {
                    const player = this.engine.getEntities()[0];
                    if (player) {
                        this.freeCamera.setPosition(player.position.x, player.position.y);
                    }
                }
            });
        }
    }
    async handleSaveAction(slot, action) {
        try {
            if (!this.saveSystem) {
                console.error('SaveSystem not available');
                return;
            }
            switch (action) {
                case 'save':
                    await this.performSave(slot);
                    break;
                case 'load':
                    await this.performLoad(slot);
                    break;
                case 'overwrite':
                    if (confirm(`Overwrite save in Slot ${slot}?`)) {
                        await this.performSave(slot);
                    }
                    break;
            }
        }
        catch (error) {
            console.error(`Error handling save action ${action} for slot ${slot}:`, error);
        }
    }
    async performSave(slot) {
        if (!this.saveSystem || !this.engine) {
            console.error('SaveSystem or Engine not available');
            return;
        }
        try {
            // Capture current game state
            const saveData = await this.captureGameState();
            // Save to IndexedDB
            await this.saveSystem.save(slot, saveData);
            // Update UI
            await this.updateSaveSlotsDisplay();
            console.log(`Game saved to slot ${slot}`);
        }
        catch (error) {
            console.error(`Error saving to slot ${slot}:`, error);
            alert('Failed to save game. Please try again.');
        }
    }
    async performLoad(slot) {
        if (!this.saveSystem || !this.engine) {
            console.error('SaveSystem or Engine not available');
            return;
        }
        try {
            // Load from IndexedDB
            const result = await this.saveSystem.load(slot);
            if (!result.success || !result.saveData) {
                console.error(`No save data found in slot ${slot}`);
                return;
            }
            // Restore game state
            await this.restoreGameState(result.saveData);
            // Close menu and resume game
            this.close();
            console.log(`Game loaded from slot ${slot}`);
        }
        catch (error) {
            console.error(`Error loading from slot ${slot}:`, error);
            alert('Failed to load game. Please try again.');
        }
    }
    async captureGameState() {
        if (!this.engine) {
            throw new Error('Engine not available');
        }
        // Get player entity (assuming first entity is player)
        const entities = this.engine.getEntities();
        const player = entities[0];
        if (!player) {
            throw new Error('Player entity not found');
        }
        // Convert inventory array to record for save format
        const inventoryRecord = {};
        player.inventory.forEach((item, index) => {
            inventoryRecord[item] = (inventoryRecord[item] || 0) + 1;
        });
        return {
            version: '1.0',
            level: 1,
            room: 1,
            player: {
                position: { x: player.position.x, y: player.position.y },
                velocity: { x: player.velocity.x, y: player.velocity.y },
                health: player.health,
                maxHealth: 100,
                hasSword: player.hasItem('sword'),
                isOnGround: true,
                facingDirection: 'right',
                animationState: 'idle',
                invulnerable: false,
                invulnerabilityTimer: 0,
                inventory: inventoryRecord
            },
            timer: 0,
            flags: {},
            rngSeed: Math.floor(Math.random() * 1000000),
            enemies: [],
            thumbnail: '',
            packId: 'default',
            packVersion: '1.0.0'
        };
    }
    async restoreGameState(saveData) {
        if (!this.engine) {
            throw new Error('Engine not available');
        }
        // Get player entity
        const entities = this.engine.getEntities();
        const player = entities[0];
        if (!player) {
            throw new Error('Player entity not found');
        }
        // Restore player state
        player.position.x = saveData.player.position.x;
        player.position.y = saveData.player.position.y;
        player.health = saveData.player.health;
        // Convert inventory record back to array
        const inventoryArray = [];
        const inventory = saveData.player.inventory || {};
        Object.entries(inventory).forEach(([item, count]) => {
            for (let i = 0; i < count; i++) {
                inventoryArray.push(item);
            }
        });
        player.inventory = inventoryArray;
        // TODO: Restore world state, scripting variables, etc.
        console.log('Game state restored from save');
    }
    async updateSaveSlotsDisplay() {
        if (!this.saveSystem) {
            return;
        }
        try {
            const saveSlots = await this.saveSystem.listSaves();
            for (let i = 0; i < 3; i++) {
                const slot = i;
                const saveSlot = saveSlots[i];
                const slotElement = document.querySelector(`[data-slot="${slot + 1}"]`);
                if (!slotElement)
                    continue;
                const statusElement = slotElement.querySelector('.save-status');
                const timeElement = slotElement.querySelector('.save-time');
                const thumbnailElement = slotElement.querySelector('img');
                const saveBtn = slotElement.querySelector('.save-btn');
                const loadBtn = slotElement.querySelector('.load-btn');
                const overwriteBtn = slotElement.querySelector('.overwrite-btn');
                if (saveSlot && !saveSlot.isEmpty && saveSlot.saveData) {
                    // Slot has save data
                    const save = saveSlot.saveData;
                    statusElement.textContent = `Level ${save.level}`;
                    timeElement.textContent = new Date(save.timestamp).toLocaleString();
                    if (save.thumbnail) {
                        thumbnailElement.src = save.thumbnail;
                    }
                    saveBtn.style.display = 'none';
                    loadBtn.style.display = 'inline-block';
                    overwriteBtn.style.display = 'inline-block';
                }
                else {
                    // Empty slot
                    statusElement.textContent = 'Empty';
                    timeElement.textContent = '';
                    // Reset to placeholder thumbnail
                    thumbnailElement.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDA%2BIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+RW1wdHk8L3RleHQ+PC9zdmc+";
                    saveBtn.style.display = 'inline-block';
                    loadBtn.style.display = 'none';
                    overwriteBtn.style.display = 'none';
                }
            }
        }
        catch (error) {
            console.error('Error updating save slots display:', error);
        }
    }
    handleSaveSlot(slot) {
        try {
            // Validate slot number
            if (slot < 0 || slot > 2) {
                console.error(`Invalid save slot: ${slot}`);
                return;
            }
            const existing = this.saveManager.load(slot);
            if (existing) {
                const doLoad = confirm(`Load saved game from Slot ${slot + 1}?`);
                if (doLoad) {
                    this.loadGame(existing);
                }
                else if (confirm(`Overwrite Slot ${slot + 1}?`)) {
                    this.saveGame(slot);
                }
            }
            else {
                if (confirm(`Save current game to Slot ${slot + 1}?`)) {
                    this.saveGame(slot);
                }
            }
            this.updateSaveStatus();
        }
        catch (error) {
            console.error("Error handling save slot:", error);
        }
    }
    handlePackSelection(packFile) {
        if (confirm(`Load game pack "${packFile}"? Unsaved progress will be lost.`)) {
            // Reload page with new pack parameter
            const url = new URL(window.location.href);
            url.searchParams.set('pack', packFile);
            window.location.href = url.toString();
        }
    }
    handleResetGame() {
        const resetBtn = document.getElementById("resetBtn");
        if (!resetBtn) {
            console.error("Reset button not found");
            return;
        }
        if (!this.resetConfirmationActive) {
            // First click - activate confirmation
            this.resetConfirmationActive = true;
            resetBtn.textContent = "Click again to confirm reset";
            resetBtn.style.backgroundColor = "#DC143C";
            resetBtn.style.borderColor = "#FF0000";
            // Set timeout to reset confirmation after 3 seconds
            this.resetConfirmationTimeout = window.setTimeout(() => {
                this.resetConfirmationActive = false;
                if (resetBtn) {
                    resetBtn.textContent = "Reset Game";
                    resetBtn.style.backgroundColor = "#8B0000";
                    resetBtn.style.borderColor = "#DC143C";
                }
            }, 3000);
        }
        else {
            // Second click - confirm reset
            this.resetConfirmationActive = false;
            if (this.resetConfirmationTimeout) {
                clearTimeout(this.resetConfirmationTimeout);
                this.resetConfirmationTimeout = null;
            }
            // Reset the button appearance
            resetBtn.textContent = "Reset Game";
            resetBtn.style.backgroundColor = "#8B0000";
            resetBtn.style.borderColor = "#DC143C";
            // Perform the actual reset
            this.performGameReset();
        }
    }
    performGameReset() {
        try {
            // Clear all save data
            this.saveManager.clear(0);
            this.saveManager.clear(1);
            this.saveManager.clear(2);
            // Reload the page to reset the game state
            window.location.reload();
        }
        catch (error) {
            console.error("Error during game reset:", error);
            alert("Failed to reset game. Please refresh the page manually.");
        }
    }
    applyDevCheats() {
        if (!this.cheatManager)
            return;
        const godElement = document.getElementById("devCheatGod");
        const noclipElement = document.getElementById("devCheatNoClip");
        const infTimeElement = document.getElementById("devCheatInfTime");
        const giveSwordElement = document.getElementById("devCheatGiveSword");
        const healthElement = document.getElementById("devCheatHealth");
        if (!godElement || !noclipElement || !infTimeElement || !giveSwordElement || !healthElement) {
            console.error("Dev cheat elements not found");
            return;
        }
        const god = godElement.checked;
        const noclip = noclipElement.checked;
        const infTime = infTimeElement.checked;
        const giveSword = giveSwordElement.checked;
        const health = Number(healthElement.value);
        // Use new CheatManager API
        this.cheatManager.set(CheatFlag.God, god);
        this.cheatManager.set(CheatFlag.Noclip, noclip);
        this.cheatManager.set(CheatFlag.InfTime, infTime);
        this.cheatManager.set(CheatFlag.GiveSword, giveSword);
        // Set health override (null if 0 or invalid)
        if (health > 0) {
            this.cheatManager.setHealthOverride(health);
        }
        else {
            this.cheatManager.setHealthOverride(null);
        }
        // Apply health immediately if set
        if (health > 0 && this.engine) {
            const player = this.engine.getEntities()[0];
            if (player) {
                player.health = health;
            }
        }
        this.updateDevActiveCheatsDisplay();
    }
    updateDevActiveCheatsDisplay() {
        if (!this.cheatManager)
            return;
        const activeCheatsDiv = document.getElementById("devActiveCheats");
        if (!activeCheatsDiv)
            return;
        const activeCheats = this.cheatManager.getActiveFlags();
        if (activeCheats.length === 0) {
            activeCheatsDiv.textContent = "None";
        }
        else {
            activeCheatsDiv.textContent = activeCheats.join(", ");
        }
    }
    syncDevCheckboxes() {
        if (!this.cheatManager || !this.debugOverlay || !this.freeCamera)
            return;
        // Sync checkboxes with current cheat states
        const elements = {
            god: document.getElementById("devCheatGod"),
            noclip: document.getElementById("devCheatNoClip"),
            infTime: document.getElementById("devCheatInfTime"),
            giveSword: document.getElementById("devCheatGiveSword"),
            health: document.getElementById("devCheatHealth"),
            debugOverlay: document.getElementById("devDebugOverlay"),
            freeCamera: document.getElementById("devFreeCamera")
        };
        // Check if all required elements exist
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
        if (missingElements.length > 0) {
            console.warn(`Missing dev checkbox elements: ${missingElements.join(', ')}`);
            return;
        }
        // Update checkbox states using new API
        elements.god.checked = this.cheatManager.on(CheatFlag.God);
        elements.noclip.checked = this.cheatManager.on(CheatFlag.Noclip);
        elements.infTime.checked = this.cheatManager.on(CheatFlag.InfTime);
        elements.giveSword.checked = this.cheatManager.on(CheatFlag.GiveSword);
        const healthValue = this.cheatManager.getHealthOverride();
        if (healthValue !== null) {
            elements.health.value = healthValue.toString();
        }
        // Sync debug tools
        elements.debugOverlay.checked = this.debugOverlay.isEnabled();
        elements.freeCamera.checked = this.freeCamera.isEnabled();
    }
    saveGame(slot) {
        // This would be implemented to collect current game state
        const saveData = {
            level: 1,
            playerX: 100,
            playerY: 100,
            health: 100,
            inventory: [],
            timestamp: Date.now(),
            packName: "example",
            version: 1
        };
        this.saveManager.save(slot, saveData);
        this.updateSaveStatus();
    }
    loadGame(saveData) {
        // This would be implemented to restore game state
        console.log("Loading game:", saveData);
        this.pauseManager.resume();
        this.close();
    }
    updateSaveStatus() {
        try {
            const saves = this.saveManager.loadAll();
            for (let i = 0; i < 3; i++) {
                const statusEl = document.getElementById(`slot${i}Status`);
                if (!statusEl) {
                    console.warn(`Save status element not found for slot ${i}`);
                    continue;
                }
                const save = saves[i];
                if (save && save.timestamp && save.level) {
                    try {
                        const date = new Date(save.timestamp);
                        statusEl.textContent = `Level ${save.level} - ${date.toLocaleString()}`;
                    }
                    catch (dateError) {
                        console.warn(`Invalid timestamp in save slot ${i}:`, dateError);
                        statusEl.textContent = `Level ${save.level} - Invalid Date`;
                    }
                }
                else {
                    statusEl.textContent = "Empty";
                }
            }
        }
        catch (error) {
            console.error("Error updating save status:", error);
        }
    }
    showMenu(menuName) {
        try {
            // Validate menu name
            const validMenus = ["main", "save", "library", "settings", "dev"];
            if (!validMenus.includes(menuName)) {
                console.error(`Invalid menu name: ${menuName}`);
                return;
            }
            // Hide all menus
            const mainMenu = document.getElementById("mainMenu");
            const saveMenu = document.getElementById("saveMenu");
            const libraryMenu = document.getElementById("libraryMenu");
            const settingsMenu = document.getElementById("settingsMenu");
            const devMenu = document.getElementById("devMenu");
            if (mainMenu)
                mainMenu.style.display = "none";
            if (saveMenu)
                saveMenu.style.display = "none";
            if (libraryMenu)
                libraryMenu.style.display = "none";
            if (settingsMenu)
                settingsMenu.style.display = "none";
            if (devMenu)
                devMenu.style.display = "none";
            // Show selected menu
            const targetMenu = document.getElementById(`${menuName}Menu`);
            if (targetMenu) {
                targetMenu.style.display = "block";
                this.currentMenu = menuName;
            }
            else {
                console.error(`Menu element not found: ${menuName}Menu`);
                return;
            }
            // Update save status if showing save menu
            if (menuName === "save") {
                this.updateSaveStatus();
            }
            // Update dev panel if showing dev menu
            if (menuName === "dev") {
                this.updateDevActiveCheatsDisplay();
                this.syncDevCheckboxes();
            }
            // Load settings if showing settings menu
            if (menuName === "settings") {
                this.loadSettingsFromStore();
            }
            // Update save slots if showing save menu
            if (menuName === "save") {
                this.updateSaveSlotsDisplay();
            }
        }
        catch (error) {
            console.error("Error showing menu:", error);
        }
    }
    setupKeyboardShortcuts() {
        const keydownHandler = (e) => {
            // Toggle menu with P key or Escape key
            if ((e.code === "KeyP" || e.code === "Escape") && (this.overlay.style.display === "none" || !this.overlay.style.display)) {
                this.toggle();
            }
            // Open dev menu with backtick key if menu is currently closed
            if (e.code === "Backquote" && (this.overlay.style.display === "none" || !this.overlay.style.display)) {
                console.log("Backtick key pressed - opening dev menu");
                this.openDevMenu();
            }
            // Close menu with Escape key when menu is open
            if (e.code === "Escape" && this.overlay.style.display !== "none") {
                this.close();
            }
            // Accessibility: Tab navigation support
            if (e.code === "Tab" && this.overlay.style.display !== "none") {
                this.handleTabNavigation(e);
            }
        };
        window.addEventListener("keydown", keydownHandler, { signal: this.abortController.signal });
        this.eventListeners.push({ element: window, type: 'keydown', listener: keydownHandler });
    }
    handleTabNavigation(e) {
        // Ensure tab navigation works within the menu
        const focusableElements = this.overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0)
            return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        if (e.shiftKey) {
            // Shift+Tab: move backwards
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        }
        else {
            // Tab: move forwards
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    open() {
        this.overlay.style.display = "block";
        this.showMenu("main");
        this.pauseManager.pause();
    }
    close() {
        this.overlay.style.display = "none";
        this.pauseManager.resume();
    }
    toggle() {
        if (this.overlay.style.display === "none" || !this.overlay.style.display) {
            this.open();
        }
        else {
            this.close();
        }
    }
    openDevMenu() {
        this.isDevMode = true;
        this.overlay.style.display = "block";
        this.showMenu("dev");
        this.pauseManager.pause();
    }
    async copyShareUrl() {
        if (!this.engine) {
            console.error("Engine not available for share URL generation");
            return false;
        }
        try {
            return await this.copyBootLink();
        }
        catch (error) {
            console.error("Error copying boot link:", error);
            return false;
        }
    }
    async copyBootLink() {
        try {
            const bootUrl = this.generateBootLink();
            await navigator.clipboard.writeText(bootUrl);
            console.log("Boot link copied to clipboard:", bootUrl);
            return true;
        }
        catch (error) {
            console.error("Failed to copy boot link:", error);
            return false;
        }
    }
    generateBootLink() {
        const params = new URLSearchParams();
        // Get current game state
        const player = this.engine?.getEntities()[0];
        const currentPlatform = this.engine?.getCurrentPlatform();
        const renderer = this.engine?.getRenderer();
        const cheatManager = this.engine?.getCheatManager();
        const settings = this.settingsStore?.getAll();
        // Add pack if different from default
        if (currentPlatform?.name.toLowerCase() !== 'snes') {
            params.set("pack", currentPlatform?.name.toLowerCase().replace(/\s+/g, "-") || "snes");
        }
        // Add level if not 1 (default)
        // TODO: Get current level from engine
        // if (currentLevel && currentLevel !== 1) {
        //     params.set("level", currentLevel.toString());
        // }
        // Add player position if not at default
        if (player) {
            if (player.position.x !== 0) {
                params.set("x", Math.floor(player.position.x).toString());
            }
            if (player.position.y !== 0) {
                params.set("y", Math.floor(player.position.y).toString());
            }
            if (player.health !== 100) {
                params.set("health", player.health.toString());
            }
        }
        // Add active cheats
        if (cheatManager) {
            const activeCheats = cheatManager.getActiveFlags();
            if (activeCheats.includes(CheatFlag.Noclip))
                params.set("noclip", "1");
            if (activeCheats.includes(CheatFlag.God))
                params.set("god", "1");
            if (activeCheats.includes(CheatFlag.InfTime))
                params.set("infTime", "1");
            if (activeCheats.includes(CheatFlag.GiveSword))
                params.set("givesword", "1");
        }
        // Add video settings if different from defaults
        if (renderer) {
            const scaleMode = renderer.getScaleMode();
            if (scaleMode !== 'integer') {
                params.set("scale", scaleMode);
            }
            if (document.fullscreenElement) {
                params.set("fullscreen", "1");
            }
        }
        // Add audio settings if different from defaults
        if (settings) {
            if (settings.audio.muted) {
                params.set("mute", "1");
            }
            if (settings.audio.master !== 1.0) {
                params.set("vol", settings.audio.master.toFixed(2));
            }
            if (settings.audio.music !== 0.8) {
                params.set("music", settings.audio.music ? "1" : "0");
            }
            if (settings.audio.sfx !== 1.0) {
                params.set("sfx", settings.audio.sfx ? "1" : "0");
            }
            if (settings.audio.latency !== 'auto') {
                params.set("latency", settings.audio.latency);
            }
        }
        // Add input settings if different from defaults
        if (settings?.accessibility) {
            if (settings.accessibility.lateJumpMs > 0) {
                params.set("jumpbuf", settings.accessibility.lateJumpMs.toString());
            }
            if (settings.accessibility.stickyGrab) {
                params.set("sticky", "1");
            }
        }
        // Add accessibility settings if different from defaults
        if (settings?.accessibility) {
            if (settings.accessibility.highContrast) {
                params.set("hud", "0"); // High contrast often means simplified HUD
            }
        }
        // Add language if not English
        if (settings?.lang && settings.lang !== 'en') {
            params.set("lang", settings.lang);
        }
        // Add cutscenes setting if disabled
        // TODO: Get current cutscene state
        // if (cutscenesDisabled) {
        //     params.set("cutscenes", "0");
        // }
        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }
    switchSettingsTab(panelId) {
        // Hide all panels
        const panels = ['controlsPanel', 'videoPanel', 'audioPanel', 'accessibilityPanel'];
        panels.forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                panel.classList.remove('active');
            }
        });
        // Remove active class from all tab buttons
        const tabButtons = ['settingsTabControls', 'settingsTabVideo', 'settingsTabAudio', 'settingsTabAccessibility'];
        tabButtons.forEach(id => {
            const tab = document.getElementById(id);
            if (tab) {
                tab.classList.remove('active');
            }
        });
        // Show selected panel
        const targetPanel = document.getElementById(panelId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        // Activate corresponding tab button
        const tabId = `settingsTab${panelId.charAt(0).toUpperCase() + panelId.slice(1).replace('Panel', '')}`;
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }
    setupVideoSettingsEvents() {
        // Scale mode
        const scaleModeSelect = document.getElementById('videoScaleMode');
        if (scaleModeSelect) {
            const scaleHandler = () => {
                const value = scaleModeSelect.value;
                this.updateSetting('video.scaleMode', value);
            };
            scaleModeSelect.addEventListener('change', scaleHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: scaleModeSelect, type: 'change', listener: scaleHandler });
        }
        // Fullscreen
        const fullscreenCheckbox = document.getElementById('videoFullscreen');
        if (fullscreenCheckbox) {
            const fullscreenHandler = () => {
                this.updateSetting('video.fullscreen', fullscreenCheckbox.checked);
            };
            fullscreenCheckbox.addEventListener('change', fullscreenHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: fullscreenCheckbox, type: 'change', listener: fullscreenHandler });
        }
        // Safe area slider
        const safeAreaSlider = document.getElementById('safeAreaSlider');
        const safeAreaValue = document.getElementById('safeAreaValue');
        if (safeAreaSlider && safeAreaValue) {
            const safeAreaHandler = () => {
                const value = Number(safeAreaSlider.value) / 100;
                safeAreaValue.textContent = `${safeAreaSlider.value}%`;
                this.updateSetting('video.safeAreaPct', value);
            };
            safeAreaSlider.addEventListener('input', safeAreaHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: safeAreaSlider, type: 'input', listener: safeAreaHandler });
        }
        // FPS cap slider
        const fpsCapSlider = document.getElementById('fpsCapSlider');
        const fpsCapValue = document.getElementById('fpsCapValue');
        if (fpsCapSlider && fpsCapValue) {
            const fpsCapHandler = () => {
                const value = Number(fpsCapSlider.value);
                fpsCapValue.textContent = value.toString();
                this.updateSetting('video.fpsCap', value);
            };
            fpsCapSlider.addEventListener('input', fpsCapHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: fpsCapSlider, type: 'input', listener: fpsCapHandler });
        }
        // V-Sync
        const vsyncCheckbox = document.getElementById('videoVsync');
        if (vsyncCheckbox) {
            const vsyncHandler = () => {
                this.updateSetting('video.vsync', vsyncCheckbox.checked);
            };
            vsyncCheckbox.addEventListener('change', vsyncHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: vsyncCheckbox, type: 'change', listener: vsyncHandler });
        }
    }
    setupAudioSettingsEvents() {
        // Mute checkbox
        const mutedCheckbox = document.getElementById('audioMuted');
        if (mutedCheckbox) {
            const mutedHandler = () => {
                this.updateSetting('audio.muted', mutedCheckbox.checked);
            };
            mutedCheckbox.addEventListener('change', mutedHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: mutedCheckbox, type: 'change', listener: mutedHandler });
        }
        // Master volume
        const masterVolumeSlider = document.getElementById('masterVolumeSlider');
        const masterVolumeValue = document.getElementById('masterVolumeValue');
        if (masterVolumeSlider && masterVolumeValue) {
            const masterVolumeHandler = () => {
                const value = Number(masterVolumeSlider.value) / 100;
                masterVolumeValue.textContent = `${masterVolumeSlider.value}%`;
                this.updateSetting('audio.master', value);
            };
            masterVolumeSlider.addEventListener('input', masterVolumeHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: masterVolumeSlider, type: 'input', listener: masterVolumeHandler });
        }
        // Music volume
        const musicVolumeSlider = document.getElementById('musicVolumeSlider');
        const musicVolumeValue = document.getElementById('musicVolumeValue');
        if (musicVolumeSlider && musicVolumeValue) {
            const musicVolumeHandler = () => {
                const value = Number(musicVolumeSlider.value) / 100;
                musicVolumeValue.textContent = `${musicVolumeSlider.value}%`;
                this.updateSetting('audio.music', value);
            };
            musicVolumeSlider.addEventListener('input', musicVolumeHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: musicVolumeSlider, type: 'input', listener: musicVolumeHandler });
        }
        // SFX volume
        const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');
        const sfxVolumeValue = document.getElementById('sfxVolumeValue');
        if (sfxVolumeSlider && sfxVolumeValue) {
            const sfxVolumeHandler = () => {
                const value = Number(sfxVolumeSlider.value) / 100;
                sfxVolumeValue.textContent = `${sfxVolumeSlider.value}%`;
                this.updateSetting('audio.sfx', value);
            };
            sfxVolumeSlider.addEventListener('input', sfxVolumeHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: sfxVolumeSlider, type: 'input', listener: sfxVolumeHandler });
        }
        // Audio latency
        const audioLatencySelect = document.getElementById('audioLatency');
        if (audioLatencySelect) {
            const audioLatencyHandler = () => {
                const value = audioLatencySelect.value;
                this.updateSetting('audio.latency', value);
            };
            audioLatencySelect.addEventListener('change', audioLatencyHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: audioLatencySelect, type: 'change', listener: audioLatencyHandler });
        }
    }
    setupAccessibilitySettingsEvents() {
        // High contrast
        const highContrastCheckbox = document.getElementById('accessibilityHighContrast');
        if (highContrastCheckbox) {
            const highContrastHandler = () => {
                this.updateSetting('accessibility.highContrast', highContrastCheckbox.checked);
                this.applyHighContrastMode(highContrastCheckbox.checked);
            };
            highContrastCheckbox.addEventListener('change', highContrastHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: highContrastCheckbox, type: 'change', listener: highContrastHandler });
        }
        // Reduce flashes
        const reduceFlashesCheckbox = document.getElementById('accessibilityReduceFlashes');
        if (reduceFlashesCheckbox) {
            const reduceFlashesHandler = () => {
                this.updateSetting('accessibility.reduceFlashes', reduceFlashesCheckbox.checked);
            };
            reduceFlashesCheckbox.addEventListener('change', reduceFlashesHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: reduceFlashesCheckbox, type: 'change', listener: reduceFlashesHandler });
        }
        // Late jump slider
        const lateJumpSlider = document.getElementById('lateJumpSlider');
        const lateJumpValue = document.getElementById('lateJumpValue');
        if (lateJumpSlider && lateJumpValue) {
            const lateJumpHandler = () => {
                const value = Number(lateJumpSlider.value);
                lateJumpValue.textContent = `${value}ms`;
                this.updateSetting('accessibility.lateJumpMs', value);
            };
            lateJumpSlider.addEventListener('input', lateJumpHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: lateJumpSlider, type: 'input', listener: lateJumpHandler });
        }
        // Sticky grab
        const stickyGrabCheckbox = document.getElementById('accessibilityStickyGrab');
        if (stickyGrabCheckbox) {
            const stickyGrabHandler = () => {
                this.updateSetting('accessibility.stickyGrab', stickyGrabCheckbox.checked);
            };
            stickyGrabCheckbox.addEventListener('change', stickyGrabHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: stickyGrabCheckbox, type: 'change', listener: stickyGrabHandler });
        }
    }
    updateSetting(path, value) {
        console.log(`Setting ${path} = ${value}`);
        // Save to SettingsStore if available
        if (this.settingsStore) {
            this.settingsStore.set(path, value);
        }
        // Apply immediate effects for certain settings
        if (path === 'accessibility.highContrast') {
            this.applyHighContrastMode(value);
        }
        // Apply video settings immediately if engine is available
        if (this.engine && path.startsWith('video.')) {
            this.applyVideoSettings(path, value);
        }
    }
    applyVideoSettings(path, value) {
        // Apply video settings to the engine/renderer
        if (path === 'video.fullscreen' && typeof value === 'boolean') {
            // TODO: Implement fullscreen toggle
            console.log('Fullscreen setting changed:', value);
        }
        if (path === 'video.scaleMode' && typeof value === 'string') {
            // TODO: Apply scale mode to renderer
            console.log('Scale mode changed:', value);
        }
        if (path === 'video.fpsCap' && typeof value === 'number') {
            // TODO: Apply FPS cap to game loop
            console.log('FPS cap changed:', value);
        }
    }
    applyHighContrastMode(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        }
        else {
            document.body.classList.remove('high-contrast');
        }
    }
    resetSettingsToDefaults() {
        // Reset all form elements to defaults
        const elements = {
            // Video
            videoScaleMode: 'integer',
            videoFullscreen: false,
            safeAreaSlider: 3,
            fpsCapSlider: 60,
            videoVsync: true,
            // Audio
            audioMuted: false,
            masterVolumeSlider: 100,
            musicVolumeSlider: 80,
            sfxVolumeSlider: 100,
            audioLatency: 'auto',
            // Accessibility
            accessibilityHighContrast: false,
            accessibilityReduceFlashes: false,
            lateJumpSlider: 0,
            accessibilityStickyGrab: false
        };
        // Update form elements
        Object.entries(elements).forEach(([id, defaultValue]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = defaultValue;
                }
                else if (element.type === 'range') {
                    element.value = defaultValue.toString();
                    // Update the display value
                    const valueElement = document.getElementById(id.replace('Slider', 'Value'));
                    if (valueElement) {
                        if (id.includes('Volume')) {
                            valueElement.textContent = `${defaultValue}%`;
                        }
                        else if (id === 'safeAreaSlider') {
                            valueElement.textContent = `${defaultValue}%`;
                        }
                        else if (id === 'fpsCapSlider') {
                            valueElement.textContent = defaultValue.toString();
                        }
                        else if (id === 'lateJumpSlider') {
                            valueElement.textContent = `${defaultValue}ms`;
                        }
                    }
                }
                else if (element.tagName === 'SELECT') {
                    element.value = defaultValue;
                }
            }
        });
        // Apply the reset settings
        this.updateSetting('video.scaleMode', 'integer');
        this.updateSetting('video.fullscreen', false);
        this.updateSetting('video.safeAreaPct', 0.03);
        this.updateSetting('video.fpsCap', 60);
        this.updateSetting('video.vsync', true);
        this.updateSetting('audio.master', 1.0);
        this.updateSetting('audio.music', 0.8);
        this.updateSetting('audio.sfx', 1.0);
        this.updateSetting('audio.muted', false);
        this.updateSetting('audio.latency', 'auto');
        this.updateSetting('accessibility.highContrast', false);
        this.updateSetting('accessibility.reduceFlashes', false);
        this.updateSetting('accessibility.lateJumpMs', 0);
        this.updateSetting('accessibility.stickyGrab', false);
        // Remove high contrast mode
        this.applyHighContrastMode(false);
        console.log('Settings reset to defaults');
    }
    loadSettingsFromStore() {
        if (!this.settingsStore) {
            console.warn('SettingsStore not available, using defaults');
            return;
        }
        try {
            // Load video settings
            const scaleMode = this.settingsStore.get('video.scaleMode');
            const fullscreen = this.settingsStore.get('video.fullscreen');
            const safeAreaPct = this.settingsStore.get('video.safeAreaPct');
            const fpsCap = this.settingsStore.get('video.fpsCap');
            const vsync = this.settingsStore.get('video.vsync');
            // Load audio settings
            const masterVolume = this.settingsStore.get('audio.master');
            const musicVolume = this.settingsStore.get('audio.music');
            const sfxVolume = this.settingsStore.get('audio.sfx');
            const muted = this.settingsStore.get('audio.muted');
            const latency = this.settingsStore.get('audio.latency');
            // Load accessibility settings
            const highContrast = this.settingsStore.get('accessibility.highContrast');
            const reduceFlashes = this.settingsStore.get('accessibility.reduceFlashes');
            const lateJumpMs = this.settingsStore.get('accessibility.lateJumpMs');
            const stickyGrab = this.settingsStore.get('accessibility.stickyGrab');
            // Update form elements
            this.updateFormElement('videoScaleMode', scaleMode);
            this.updateFormElement('videoFullscreen', fullscreen);
            this.updateFormElement('safeAreaSlider', safeAreaPct ? Math.round(safeAreaPct * 100) : 3);
            this.updateFormElement('fpsCapSlider', fpsCap || 60);
            this.updateFormElement('videoVsync', vsync);
            this.updateFormElement('audioMuted', muted);
            this.updateFormElement('masterVolumeSlider', masterVolume ? Math.round(masterVolume * 100) : 100);
            this.updateFormElement('musicVolumeSlider', musicVolume ? Math.round(musicVolume * 100) : 80);
            this.updateFormElement('sfxVolumeSlider', sfxVolume ? Math.round(sfxVolume * 100) : 100);
            this.updateFormElement('audioLatency', latency);
            this.updateFormElement('accessibilityHighContrast', highContrast);
            this.updateFormElement('accessibilityReduceFlashes', reduceFlashes);
            this.updateFormElement('lateJumpSlider', lateJumpMs || 0);
            this.updateFormElement('accessibilityStickyGrab', stickyGrab);
            // Update display values
            this.updateDisplayValues();
            // Apply high contrast mode
            this.applyHighContrastMode(highContrast || false);
            console.log('Settings loaded from store');
        }
        catch (error) {
            console.error('Error loading settings from store:', error);
        }
    }
    updateFormElement(id, value) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Form element not found: ${id}`);
            return;
        }
        if (element.type === 'checkbox') {
            element.checked = Boolean(value);
        }
        else if (element.type === 'range') {
            element.value = String(value);
        }
        else if (element.tagName === 'SELECT') {
            element.value = String(value);
        }
    }
    updateDisplayValues() {
        // Update safe area display
        const safeAreaSlider = document.getElementById('safeAreaSlider');
        const safeAreaValue = document.getElementById('safeAreaValue');
        if (safeAreaSlider && safeAreaValue) {
            safeAreaValue.textContent = `${safeAreaSlider.value}%`;
        }
        // Update FPS cap display
        const fpsCapSlider = document.getElementById('fpsCapSlider');
        const fpsCapValue = document.getElementById('fpsCapValue');
        if (fpsCapSlider && fpsCapValue) {
            fpsCapValue.textContent = fpsCapSlider.value;
        }
        // Update volume displays
        const volumeSliders = [
            { slider: 'masterVolumeSlider', value: 'masterVolumeValue' },
            { slider: 'musicVolumeSlider', value: 'musicVolumeValue' },
            { slider: 'sfxVolumeSlider', value: 'sfxVolumeValue' }
        ];
        volumeSliders.forEach(({ slider, value }) => {
            const sliderElement = document.getElementById(slider);
            const valueElement = document.getElementById(value);
            if (sliderElement && valueElement) {
                valueElement.textContent = `${sliderElement.value}%`;
            }
        });
        // Update late jump display
        const lateJumpSlider = document.getElementById('lateJumpSlider');
        const lateJumpValue = document.getElementById('lateJumpValue');
        if (lateJumpSlider && lateJumpValue) {
            lateJumpValue.textContent = `${lateJumpSlider.value}ms`;
        }
    }
    cleanup() {
        // Remove all event listeners to prevent memory leaks
        if (this.overlay) {
            const clone = this.overlay.cloneNode(true);
            if (this.overlay.parentNode) {
                this.overlay.parentNode.replaceChild(clone, this.overlay);
            }
        }
        // Clear any timeouts
        if (this.resetConfirmationTimeout) {
            clearTimeout(this.resetConfirmationTimeout);
            this.resetConfirmationTimeout = null;
        }
        // Abort any ongoing event listeners
        this.abortController.abort();
        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];
        console.log("PiMenu cleanup completed");
    }
    updateZIndexForFullscreen(isFullscreen) {
        const piButton = document.getElementById('piMenuButton');
        if (piButton) {
            piButton.style.zIndex = isFullscreen ? '9999' : '999';
            console.log(`PiMenu button z-index updated to ${isFullscreen ? '9999' : '999'}`);
        }
        else {
            console.warn('PiMenu button not found in updateZIndexForFullscreen');
        }
        if (this.overlay) {
            this.overlay.style.zIndex = isFullscreen ? '9999' : '1000';
            console.log(`PiMenu overlay z-index updated to ${isFullscreen ? '9999' : '1000'}`);
        }
        console.log(`PiMenu z-index updated for fullscreen: ${isFullscreen}`);
    }
    switchLibraryTab(panelId) {
        // Hide all library panels and deactivate all tabs
        const panels = ['builtin-panel', 'installed-panel', 'local-panel'];
        const tabs = ['builtin-tab', 'installed-tab', 'local-tab'];
        panels.forEach(panel => {
            const element = this.overlay.querySelector(`#${panel}`);
            if (element)
                element.classList.remove('active');
        });
        tabs.forEach(tab => {
            const element = this.overlay.querySelector(`#${tab}`);
            if (element)
                element.classList.remove('active');
        });
        // Show selected panel and activate its tab
        const selectedPanel = this.overlay.querySelector(`#${panelId}`);
        const selectedTab = this.overlay.querySelector(`#${panelId.replace('-panel', '-tab')}`);
        if (selectedPanel)
            selectedPanel.classList.add('active');
        if (selectedTab)
            selectedTab.classList.add('active');
        // Update display for the selected panel
        this.updateLibraryDisplay();
    }
    async handleLoadFromUrl() {
        // Security check: Rate limit URL loads
        const rateLimitCheck = window.ptsCore?.securityManager?.checkRateLimit('urlLoad', 'user');
        if (rateLimitCheck && !rateLimitCheck.allowed) {
            alert(`Too many URL loads. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`);
            return;
        }
        const url = prompt('Enter the URL of a .ptspack.json file:');
        if (!url)
            return;
        // Security check: Validate URL
        const securityManager = window.ptsCore?.securityManager;
        if (securityManager) {
            const urlValidation = securityManager.validateUrl(url);
            if (!urlValidation.valid) {
                alert(`URL validation failed: ${urlValidation.error}`);
                return;
            }
        }
        if (!url.startsWith('https://')) {
            alert('Only HTTPS URLs are allowed for security reasons.');
            return;
        }
        try {
            if (!this.libraryManager) {
                alert('Library manager not available.');
                return;
            }
            await this.libraryManager.loadPackFromUrl(url);
            this.updateLibraryDisplay();
            alert('Pack loaded successfully!');
        }
        catch (error) {
            console.error('Failed to load pack from URL:', error);
            alert(`Failed to load pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleClearCache() {
        if (!confirm('This will clear all cached packs and assets. Continue?')) {
            return;
        }
        try {
            if (this.libraryManager) {
                await this.libraryManager.clearCache();
            }
            this.updateLibraryDisplay();
            alert('Cache cleared successfully!');
        }
        catch (error) {
            console.error('Failed to clear cache:', error);
            alert(`Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleLocalFileLoad(event) {
        // Security check: Rate limit file uploads
        const rateLimitCheck = window.ptsCore?.securityManager?.checkRateLimit('fileUpload', 'user');
        if (rateLimitCheck && !rateLimitCheck.allowed) {
            alert(`Too many file uploads. Please wait ${Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000)} seconds.`);
            return;
        }
        const input = event.target;
        const file = input.files?.[0];
        if (!file)
            return;
        // Security check: Validate file
        const securityManager = window.ptsCore?.securityManager;
        if (securityManager) {
            const fileValidation = securityManager.validateFileUpload(file);
            if (!fileValidation.valid) {
                alert(`File validation failed: ${fileValidation.error}`);
                input.value = '';
                return;
            }
        }
        if (!file.name.endsWith('.ptspack.json')) {
            alert('Please select a .ptspack.json file.');
            input.value = '';
            return;
        }
        try {
            if (!this.libraryManager) {
                alert('Library manager not available.');
                return;
            }
            await this.libraryManager.loadPackFromFile(file);
            this.updateLibraryDisplay();
            alert('Local pack loaded successfully!');
        }
        catch (error) {
            console.error('Failed to load local pack:', error);
            alert(`Failed to load pack: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Clear the input
        input.value = '';
    }
    async handlePackLoad(packId) {
        try {
            if (!this.libraryManager) {
                alert('Library manager not available.');
                return;
            }
            await this.libraryManager.switchPack(packId);
            alert(`Switched to pack: ${packId}`);
            this.updateLibraryDisplay();
        }
        catch (error) {
            console.error('Failed to load pack:', error);
            alert('Failed to load pack. Please try again.');
        }
    }
    setupControlsEvents() {
        // Controls tab switching
        const controlsTabs = ['controlsTabKeyboard', 'controlsTabGamepad', 'controlsTabAccessibility'];
        const controlsPanels = ['keyboardControls', 'gamepadControls', 'accessibilityControls'];
        controlsTabs.forEach((tabId, index) => {
            const tab = document.getElementById(tabId);
            if (tab) {
                const tabHandler = () => {
                    // Remove active class from all tabs and panels
                    controlsTabs.forEach(id => {
                        const t = document.getElementById(id);
                        if (t)
                            t.classList.remove('active');
                    });
                    controlsPanels.forEach(id => {
                        const p = document.getElementById(id);
                        if (p)
                            p.classList.remove('active');
                    });
                    // Add active class to clicked tab and corresponding panel
                    tab.classList.add('active');
                    const panel = document.getElementById(controlsPanels[index]);
                    if (panel)
                        panel.classList.add('active');
                };
                tab.addEventListener('click', tabHandler, { signal: this.abortController.signal });
                this.eventListeners.push({ element: tab, type: 'click', listener: tabHandler });
            }
        });
        // Binding buttons
        const bindingButtons = document.querySelectorAll('.binding-btn');
        bindingButtons.forEach(button => {
            const btn = button;
            const action = btn.getAttribute('data-action');
            const device = btn.getAttribute('data-device');
            if (action && device) {
                const bindingHandler = () => {
                    this.startRebinding(action, device);
                };
                btn.addEventListener('click', bindingHandler, { signal: this.abortController.signal });
                this.eventListeners.push({ element: btn, type: 'click', listener: bindingHandler });
            }
        });
        // Keyboard preset selection
        const keyboardPreset = document.getElementById('keyboardPreset');
        if (keyboardPreset) {
            const presetHandler = () => {
                const selectedPreset = keyboardPreset.value;
                if (selectedPreset !== 'custom' && this.engine?.getInputMap) {
                    const success = this.engine.getInputMap().loadPreset(selectedPreset);
                    if (success) {
                        this.updateBindingDisplay();
                        console.log(`Loaded keyboard preset: ${selectedPreset}`);
                    }
                    else {
                        console.warn(`Failed to load preset: ${selectedPreset}`);
                    }
                }
            };
            keyboardPreset.addEventListener('change', presetHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: keyboardPreset, type: 'change', listener: presetHandler });
        }
        // Reset buttons
        const resetKeyboardBtn = document.getElementById('resetKeyboardBtn');
        if (resetKeyboardBtn) {
            const resetKeyboardHandler = () => {
                if (confirm('Reset keyboard bindings to defaults?')) {
                    this.resetKeyboardBindings();
                }
            };
            resetKeyboardBtn.addEventListener('click', resetKeyboardHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: resetKeyboardBtn, type: 'click', listener: resetKeyboardHandler });
        }
        const resetGamepadBtn = document.getElementById('resetGamepadBtn');
        if (resetGamepadBtn) {
            const resetGamepadHandler = () => {
                if (confirm('Reset gamepad bindings to defaults?')) {
                    this.resetGamepadBindings();
                }
            };
            resetGamepadBtn.addEventListener('click', resetGamepadHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: resetGamepadBtn, type: 'click', listener: resetGamepadHandler });
        }
        // Gamepad deadzone
        const gamepadDeadzone = document.getElementById('gamepadDeadzone');
        const deadzoneValue = document.getElementById('deadzoneValue');
        if (gamepadDeadzone && deadzoneValue) {
            const deadzoneHandler = () => {
                const value = Number(gamepadDeadzone.value);
                deadzoneValue.textContent = `${value}%`;
                this.updateSetting('input.deadzone', value / 100);
                // Update gamepad deadzone if available
                if (this.engine?.getInputMap) {
                    this.engine.getInputMap().setDeadzone(value);
                }
            };
            gamepadDeadzone.addEventListener('input', deadzoneHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: gamepadDeadzone, type: 'input', listener: deadzoneHandler });
        }
        // Late jump buffer
        const lateJumpBuffer = document.getElementById('lateJumpBuffer');
        const lateJumpValue = document.getElementById('lateJumpValue');
        if (lateJumpBuffer && lateJumpValue) {
            const lateJumpHandler = () => {
                const value = Number(lateJumpBuffer.value);
                lateJumpValue.textContent = `${value}ms`;
                this.updateSetting('accessibility.lateJumpMs', value);
                // Update input map if available
                if (this.engine?.getInputMap) {
                    this.engine.getInputMap().setLateJumpMs(value);
                }
            };
            lateJumpBuffer.addEventListener('input', lateJumpHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: lateJumpBuffer, type: 'input', listener: lateJumpHandler });
        }
        // Sticky grab
        const stickyGrab = document.getElementById('stickyGrab');
        if (stickyGrab) {
            const stickyGrabHandler = () => {
                this.updateSetting('accessibility.stickyGrab', stickyGrab.checked);
                // Update input map if available
                if (this.engine?.getInputMap) {
                    this.engine.getInputMap().setStickyGrab(stickyGrab.checked);
                }
            };
            stickyGrab.addEventListener('change', stickyGrabHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: stickyGrab, type: 'change', listener: stickyGrabHandler });
        }
        // Cancel rebind button
        const cancelRebindBtn = document.getElementById('cancelRebindBtn');
        if (cancelRebindBtn) {
            const cancelRebindHandler = () => {
                this.cancelRebinding();
            };
            cancelRebindBtn.addEventListener('click', cancelRebindHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: cancelRebindBtn, type: 'click', listener: cancelRebindHandler });
        }
        // Update gamepad status periodically
        this.updateGamepadStatus();
        setInterval(() => {
            this.updateGamepadStatus();
        }, 1000);
    }
    startRebinding(action, device) {
        if (!this.engine?.getInputMap) {
            console.warn('InputMap not available for rebinding');
            return;
        }
        try {
            // Validate action is a valid input action
            const validActions = ['Left', 'Right', 'Up', 'Down', 'Jump', 'Action', 'Block', 'Pause'];
            if (!validActions.includes(action)) {
                console.warn(`Invalid action for rebinding: ${action}`);
                return;
            }
            this.engine.getInputMap().startRebind(action, device);
        }
        catch (error) {
            console.error(`Failed to rebind ${action}:`, error);
        }
    }
    cancelRebinding() {
        if (this.engine?.getInputMap) {
            this.engine.getInputMap().cancelRebind();
        }
        const overlay = document.getElementById('rebindingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    updateBindingDisplay() {
        if (!this.engine?.getInputMap)
            return;
        const profile = this.engine.getInputMap().getProfile();
        // Update keyboard bindings
        Object.entries(profile.keyboard).forEach(([action, key]) => {
            const btn = document.querySelector(`[data-action="${action}"][data-device="keyboard"]`);
            if (btn) {
                btn.textContent = this.formatKeyName(key);
            }
        });
        // Update gamepad bindings
        Object.entries(profile.gamepad).forEach(([action, button]) => {
            const btn = document.querySelector(`[data-action="${action}"][data-device="gamepad"]`);
            if (btn) {
                btn.textContent = this.formatButtonName(button);
            }
        });
    }
    formatKeyName(key) {
        const keyMap = {
            'KeyA': 'A', 'KeyB': 'B', 'KeyC': 'C', 'KeyD': 'D', 'KeyE': 'E',
            'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyI': 'I', 'KeyJ': 'J',
            'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M', 'KeyN': 'N', 'KeyO': 'O',
            'KeyP': 'P', 'KeyQ': 'Q', 'KeyR': 'R', 'KeyS': 'S', 'KeyT': 'T',
            'KeyU': 'U', 'KeyV': 'V', 'KeyW': 'W', 'KeyX': 'X', 'KeyY': 'Y',
            'KeyZ': 'Z', 'Space': 'Space', 'Escape': 'Esc', 'Enter': 'Enter',
            'ShiftLeft': 'Shift', 'ControlLeft': 'Ctrl', 'AltLeft': 'Alt',
            'ArrowLeft': '←', 'ArrowRight': '→', 'ArrowUp': '↑', 'ArrowDown': '↓'
        };
        return keyMap[key] || key;
    }
    formatButtonName(button) {
        const buttonMap = {
            'DPadLeft': 'DPad ←', 'DPadRight': 'DPad →', 'DPadUp': 'DPad ↑', 'DPadDown': 'DPad ↓',
            'ButtonA': 'A Button', 'ButtonB': 'B Button', 'ButtonX': 'X Button', 'ButtonY': 'Y Button',
            'ButtonL1': 'L1', 'ButtonR1': 'R1', 'ButtonL2': 'L2', 'ButtonR2': 'R2',
            'ButtonSelect': 'Select', 'ButtonStart': 'Start', 'ButtonL3': 'L3', 'ButtonR3': 'R3'
        };
        return buttonMap[button] || button;
    }
    resetKeyboardBindings() {
        if (!this.engine?.getInputMap)
            return;
        const defaultProfile = {
            keyboard: {
                Left: 'KeyA',
                Right: 'KeyD',
                Up: 'KeyW',
                Down: 'KeyS',
                Jump: 'Space',
                Action: 'KeyE',
                Block: 'KeyQ',
                Pause: 'Escape'
            }
        };
        this.engine.getInputMap().setProfile({ ...this.engine.getInputMap().getProfile(), ...defaultProfile });
        this.updateBindingDisplay();
    }
    resetGamepadBindings() {
        if (!this.engine?.getInputMap)
            return;
        const defaultProfile = {
            gamepad: {
                Left: 'DPadLeft',
                Right: 'DPadRight',
                Up: 'DPadUp',
                Down: 'DPadDown',
                Jump: 'ButtonA',
                Action: 'ButtonB',
                Block: 'ButtonX',
                Pause: 'ButtonStart'
            }
        };
        this.engine.getInputMap().setProfile({ ...this.engine.getInputMap().getProfile(), ...defaultProfile });
        this.updateBindingDisplay();
    }
    updateGamepadStatus() {
        const statusElement = document.getElementById('gamepadConnected');
        if (!statusElement)
            return;
        if (this.engine?.getGamepad) {
            const gamepad = this.engine.getGamepad();
            if (gamepad && gamepad.isConnected()) {
                const count = gamepad.getConnectedCount();
                statusElement.textContent = `Connected (${count} gamepad${count > 1 ? 's' : ''})`;
                statusElement.style.color = '#0F0';
            }
            else {
                statusElement.textContent = 'Not Connected';
                statusElement.style.color = '#F00';
            }
        }
        else {
            statusElement.textContent = 'Not Available';
            statusElement.style.color = '#666';
        }
    }
    updateDevMenu() {
        if (!this.cheatManager || !this.debugOverlay || !this.freeCamera) {
            console.warn('Dev tools not available for menu update');
            return;
        }
        const elements = {
            god: document.getElementById('devGod'),
            noclip: document.getElementById('devNoclip'),
            infTime: document.getElementById('devInfTime'),
            giveSword: document.getElementById('devGiveSword'),
            health: document.getElementById('devHealth'),
            debugOverlay: document.getElementById('devDebugOverlay'),
            freeCamera: document.getElementById('devFreeCamera')
        };
        // Check for missing elements
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);
        if (missingElements.length > 0) {
            console.warn(`Missing dev checkbox elements: ${missingElements.join(', ')}`);
            return;
        }
        // Update cheat checkboxes
        elements.god.checked = this.cheatManager.on(CheatFlag.God);
        elements.noclip.checked = this.cheatManager.on(CheatFlag.Noclip);
        elements.infTime.checked = this.cheatManager.on(CheatFlag.InfTime);
        elements.giveSword.checked = this.cheatManager.on(CheatFlag.GiveSword);
        // Update health input
        const healthValue = this.cheatManager.getHealthOverride() ?? 100;
        elements.health.value = healthValue.toString();
        // Update dev tool checkboxes
        elements.debugOverlay.checked = this.debugOverlay.isEnabled();
        elements.freeCamera.checked = this.freeCamera.isEnabled();
    }
}
//# sourceMappingURL=PiMenu.js.map