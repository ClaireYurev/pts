import { CheatFlag } from "../dev/CheatManager.js";
import { BootConfigManager } from "../engine/BootConfig.js";
export class PiMenu {
    constructor(pauseManager, saveManager) {
        this.currentMenu = "main";
        this.resetConfirmationActive = false;
        this.resetConfirmationTimeout = null;
        this.isDevMode = false;
        this.eventListeners = [];
        this.pauseManager = pauseManager;
        this.saveManager = saveManager;
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
        piButton.style.zIndex = "999";
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
            <button id="shareBtn" class="menu-btn" style="background-color: #0066cc; border-color: #0099ff;">Copy Share Link</button>
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
        saveMenu.style.maxWidth = "400px";
        saveMenu.style.margin = "50px auto";
        saveMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        saveMenu.style.padding = "20px";
        saveMenu.style.borderRadius = "10px";
        saveMenu.style.border = "2px solid #666";
        saveMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">Save/Load</h2>
            <button data-slot="0" class="save-slot-btn">Slot 1 - <span id="slot0Status">Empty</span></button>
            <button data-slot="1" class="save-slot-btn">Slot 2 - <span id="slot1Status">Empty</span></button>
            <button data-slot="2" class="save-slot-btn">Slot 3 - <span id="slot2Status">Empty</span></button>
            <button id="backFromSaveBtn" class="menu-btn">Back</button>
        `;
        this.overlay.appendChild(saveMenu);
        this.setupSaveMenuEvents();
    }
    createLibraryMenu() {
        const libraryMenu = document.createElement("div");
        libraryMenu.id = "libraryMenu";
        libraryMenu.style.display = "none";
        libraryMenu.style.textAlign = "center";
        libraryMenu.style.maxWidth = "400px";
        libraryMenu.style.margin = "50px auto";
        libraryMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        libraryMenu.style.padding = "20px";
        libraryMenu.style.borderRadius = "10px";
        libraryMenu.style.border = "2px solid #666";
        libraryMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">Game Library</h2>
            <div id="packList">
                <button data-pack="packs/example.ptspack.json" class="pack-btn">Example Pack</button>
                <button data-pack="packs/adventure.ptspack.json" class="pack-btn">Adventure Pack</button>
                <button data-pack="packs/dungeon.ptspack.json" class="pack-btn">Dungeon Pack</button>
            </div>
            <button id="backFromLibraryBtn" class="menu-btn">Back</button>
        `;
        this.overlay.appendChild(libraryMenu);
        this.setupLibraryMenuEvents();
    }
    createSettingsMenu() {
        const settingsMenu = document.createElement("div");
        settingsMenu.id = "settingsMenu";
        settingsMenu.style.display = "none";
        settingsMenu.style.textAlign = "center";
        settingsMenu.style.maxWidth = "400px";
        settingsMenu.style.margin = "50px auto";
        settingsMenu.style.backgroundColor = "rgba(0,0,0,0.8)";
        settingsMenu.style.padding = "20px";
        settingsMenu.style.borderRadius = "10px";
        settingsMenu.style.border = "2px solid #666";
        settingsMenu.innerHTML = `
            <h2 style="margin-top: 0; color: #FFF;">Settings</h2>
            <p style="color: #CCC;">Settings functionality coming soon!</p>
            <button id="backFromSettingsBtn" class="menu-btn">Back</button>
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
            backFromSaveBtn.onclick = () => {
                this.showMenu("main");
            };
        }
        // Save slot buttons
        document.querySelectorAll("#saveMenu button[data-slot]").forEach(btn => {
            btn.addEventListener("click", () => {
                const slot = Number(btn.dataset.slot);
                this.handleSaveSlot(slot);
            });
        });
    }
    setupSettingsMenuEvents() {
        // Back button
        const backFromSettingsBtn = document.getElementById("backFromSettingsBtn");
        if (backFromSettingsBtn) {
            backFromSettingsBtn.onclick = () => {
                this.showMenu("main");
            };
        }
    }
    setupLibraryMenuEvents() {
        // Back button
        const backFromLibraryBtn = document.getElementById("backFromLibraryBtn");
        if (backFromLibraryBtn) {
            backFromLibraryBtn.onclick = () => {
                this.showMenu("main");
            };
        }
        // Pack buttons
        document.querySelectorAll("#libraryMenu button[data-pack]").forEach(btn => {
            btn.addEventListener("click", () => {
                const packFile = btn.dataset.pack;
                this.handlePackSelection(packFile);
            });
        });
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
                    this.cheatManager.resetAll();
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
                    this.debugOverlay.enabled = target.checked;
                }
            });
        }
        // Free camera toggle
        const devFreeCamera = document.getElementById("devFreeCamera");
        if (devFreeCamera) {
            devFreeCamera.addEventListener("change", (e) => {
                const target = e.target;
                if (this.freeCamera) {
                    this.freeCamera.enabled = target.checked;
                    if (!target.checked && this.engine) {
                        // Reset camera to player when disabling
                        const player = this.engine.getEntities()[0];
                        if (player) {
                            this.freeCamera.resetToPlayer(player.position.x, player.position.y, this.engine.canvas.width, this.engine.canvas.height);
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
                        this.freeCamera.resetToPlayer(player.position.x, player.position.y, this.engine.canvas.width, this.engine.canvas.height);
                    }
                }
            });
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
        this.cheatManager.setCheat(CheatFlag.GodMode, god);
        this.cheatManager.setCheat(CheatFlag.NoClip, noclip);
        this.cheatManager.setCheat(CheatFlag.InfiniteTime, infTime);
        this.cheatManager.setCheat(CheatFlag.GiveSword, giveSword);
        this.cheatManager.setCheat(CheatFlag.SetHealth, health);
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
        const activeCheats = this.cheatManager.getActiveCheats();
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
        // Update checkbox states
        elements.god.checked = this.cheatManager.isActive(CheatFlag.GodMode);
        elements.noclip.checked = this.cheatManager.isActive(CheatFlag.NoClip);
        elements.infTime.checked = this.cheatManager.isActive(CheatFlag.InfiniteTime);
        elements.giveSword.checked = this.cheatManager.isActive(CheatFlag.GiveSword);
        const healthValue = this.cheatManager.getValue(CheatFlag.SetHealth);
        if (healthValue !== null) {
            elements.health.value = healthValue.toString();
        }
        // Sync debug tools
        elements.debugOverlay.checked = this.debugOverlay.enabled;
        elements.freeCamera.checked = this.freeCamera.enabled;
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
        }
        catch (error) {
            console.error("Error showing menu:", error);
        }
    }
    setupKeyboardShortcuts() {
        const keydownHandler = (e) => {
            // Only open menu with P key if menu is currently closed
            if (e.code === "KeyP" && (this.overlay.style.display === "none" || !this.overlay.style.display)) {
                this.toggle();
            }
            // Open dev menu with backtick key if menu is currently closed
            if (e.code === "Backquote" && (this.overlay.style.display === "none" || !this.overlay.style.display)) {
                console.log("Backtick key pressed - opening dev menu");
                this.openDevMenu();
            }
            // Accessibility: Escape key to close menu
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
            return await BootConfigManager.copyShareUrl(this.engine);
        }
        catch (error) {
            console.error("Error copying share URL:", error);
            return false;
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
}
//# sourceMappingURL=PiMenu.js.map