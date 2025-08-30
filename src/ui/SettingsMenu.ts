export interface Settings {
    keyBindings: Record<string, string>;
    volume: number;
    fullscreen: boolean;
    highContrast: boolean;
    fpsDisplay: boolean;
}

export class SettingsMenu {
    private overlay!: HTMLDivElement;
    private settings: Settings;
    private defaultSettings: Settings = {
        keyBindings: {
            moveLeft: "KeyA",
            moveRight: "KeyD",
            moveUp: "KeyW",
            moveDown: "KeyS",
            jump: "Space",
            menu: "KeyP"
        },
        volume: 50,
        fullscreen: false,
        highContrast: false,
        fpsDisplay: false
    };

    constructor() {
        this.settings = this.loadSettings();
        this.createOverlay();
        this.setupEventListeners();
    }

    private createOverlay(): void {
        this.overlay = document.createElement("div");
        this.overlay.id = "settingsOverlay";
        this.overlay.style.position = "fixed";
        this.overlay.style.top = "0";
        this.overlay.style.left = "0";
        this.overlay.style.width = "100%";
        this.overlay.style.height = "100%";
        this.overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
        this.overlay.style.display = "none";
        this.overlay.style.zIndex = "2000";
        this.overlay.style.fontFamily = "Arial, sans-serif";
        this.overlay.style.color = "#FFF";
        this.overlay.style.padding = "20px";
        this.overlay.style.boxSizing = "border-box";
        this.overlay.style.overflowY = "auto";

        this.overlay.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; background: rgba(0,0,0,0.9); padding: 30px; border-radius: 10px; border: 2px solid #666;">
                <h2 style="margin-top: 0; color: #FFF; text-align: center;">Settings</h2>
                
                <fieldset style="border: 1px solid #666; margin: 20px 0; padding: 15px;">
                    <legend style="color: #FFF; font-weight: bold;">Controls</legend>
                    <div style="margin: 10px 0;">
                        <label>Move Left: <span id="bindMoveLeft">${this.settings.keyBindings.moveLeft}</span></label>
                        <button id="changeMoveLeft" class="settings-btn">Change</button>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Move Right: <span id="bindMoveRight">${this.settings.keyBindings.moveRight}</span></label>
                        <button id="changeMoveRight" class="settings-btn">Change</button>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Move Up: <span id="bindMoveUp">${this.settings.keyBindings.moveUp}</span></label>
                        <button id="changeMoveUp" class="settings-btn">Change</button>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Move Down: <span id="bindMoveDown">${this.settings.keyBindings.moveDown}</span></label>
                        <button id="changeMoveDown" class="settings-btn">Change</button>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Jump: <span id="bindJump">${this.settings.keyBindings.jump}</span></label>
                        <button id="changeJump" class="settings-btn">Change</button>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Menu: <span id="bindMenu">${this.settings.keyBindings.menu}</span></label>
                        <button id="changeMenu" class="settings-btn">Change</button>
                    </div>
                </fieldset>

                <fieldset style="border: 1px solid #666; margin: 20px 0; padding: 15px;">
                    <legend style="color: #FFF; font-weight: bold;">Audio</legend>
                    <div style="margin: 10px 0;">
                        <label>Master Volume: </label>
                        <input type="range" id="volumeSlider" min="0" max="100" value="${this.settings.volume}" style="width: 200px;">
                        <span id="volumeLabel">${this.settings.volume}%</span>
                    </div>
                </fieldset>

                <fieldset style="border: 1px solid #666; margin: 20px 0; padding: 15px;">
                    <legend style="color: #FFF; font-weight: bold;">Video</legend>
                    <div style="margin: 10px 0;">
                        <label>Fullscreen: </label>
                        <input type="checkbox" id="fullscreenToggle" ${this.settings.fullscreen ? 'checked' : ''}>
                    </div>
                    <div style="margin: 10px 0;">
                        <label>Show FPS: </label>
                        <input type="checkbox" id="fpsToggle" ${this.settings.fpsDisplay ? 'checked' : ''}>
                    </div>
                </fieldset>

                <fieldset style="border: 1px solid #666; margin: 20px 0; padding: 15px;">
                    <legend style="color: #FFF; font-weight: bold;">Accessibility</legend>
                    <div style="margin: 10px 0;">
                        <label>High Contrast: </label>
                        <input type="checkbox" id="contrastToggle" ${this.settings.highContrast ? 'checked' : ''}>
                    </div>
                </fieldset>

                <div style="text-align: center; margin-top: 30px;">
                    <button id="applySettings" class="settings-btn" style="margin: 0 10px;">Apply</button>
                    <button id="cancelSettings" class="settings-btn" style="margin: 0 10px;">Cancel</button>
                    <button id="resetSettings" class="settings-btn" style="margin: 0 10px;">Reset to Defaults</button>
                </div>
            </div>
        `;

        // Close menu when clicking outside
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) {
                this.close();
            }
        };

        document.body.appendChild(this.overlay);
    }

    private setupEventListeners(): void {
        // Volume slider
        const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
        const volumeLabel = document.getElementById("volumeLabel");
        if (volumeSlider && volumeLabel) {
            volumeSlider.oninput = () => {
                const value = volumeSlider.valueAsNumber;
                volumeLabel.textContent = value + "%";
                this.settings.volume = value;
            };
        }

        // Fullscreen toggle
        const fullscreenToggle = document.getElementById("fullscreenToggle") as HTMLInputElement;
        fullscreenToggle.onchange = () => {
            this.settings.fullscreen = fullscreenToggle.checked;
        };

        // FPS toggle
        const fpsToggle = document.getElementById("fpsToggle") as HTMLInputElement;
        fpsToggle.onchange = () => {
            this.settings.fpsDisplay = fpsToggle.checked;
        };

        // High contrast toggle
        const contrastToggle = document.getElementById("contrastToggle") as HTMLInputElement;
        contrastToggle.onchange = () => {
            this.settings.highContrast = contrastToggle.checked;
            this.applyHighContrast();
        };

        // Key rebinding
        this.setupKeyRebinding("changeMoveLeft", "bindMoveLeft", "moveLeft");
        this.setupKeyRebinding("changeMoveRight", "bindMoveRight", "moveRight");
        this.setupKeyRebinding("changeMoveUp", "bindMoveUp", "moveUp");
        this.setupKeyRebinding("changeMoveDown", "bindMoveDown", "moveDown");
        this.setupKeyRebinding("changeJump", "bindJump", "jump");
        this.setupKeyRebinding("changeMenu", "bindMenu", "menu");

        // Apply/Cancel/Reset buttons
        const applyBtn = document.getElementById("applySettings");
        const cancelBtn = document.getElementById("cancelSettings");
        const resetBtn = document.getElementById("resetSettings");
        
        if (applyBtn) {
            applyBtn.onclick = () => {
                this.applySettings();
                this.close();
            };
        }
        
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                this.close();
            };
        }
        
        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm("Reset all settings to defaults?")) {
                    this.settings = { ...this.defaultSettings };
                    this.saveSettings();
                    this.updateDisplay();
                    this.applySettings();
                }
            };
        }
    }

    private setupKeyRebinding(buttonId: string, displayId: string, settingKey: string): void {
        const button = document.getElementById(buttonId);
        const display = document.getElementById(displayId);
        
        if (!button || !display) {
            console.warn(`Failed to find elements for key rebinding: ${buttonId}, ${displayId}`);
            return;
        }
        
        button.addEventListener("click", () => {
            display.textContent = "Press any key...";
            display.style.color = "#FFD700";

            const listener = (e: KeyboardEvent) => {
                this.settings.keyBindings[settingKey] = e.code;
                display.textContent = e.code;
                display.style.color = "#FFF";
                window.removeEventListener("keydown", listener);
                e.preventDefault();
            };

            window.addEventListener("keydown", listener);
        });
    }

    private applySettings(): void {
        this.saveSettings();
        
        // Apply fullscreen
        if (this.settings.fullscreen) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(console.error);
            }
        } else {
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(console.error);
            }
        }

        // Apply high contrast
        this.applyHighContrast();

        // Apply FPS display (would need to be connected to GameEngine)
        console.log("FPS display:", this.settings.fpsDisplay);

        // Apply volume (would need to be connected to AudioManager)
        console.log("Volume set to:", this.settings.volume);

        console.log("Settings applied:", this.settings);
    }

    private applyHighContrast(): void {
        if (this.settings.highContrast) {
            document.body.classList.add("high-contrast");
        } else {
            document.body.classList.remove("high-contrast");
        }
    }

    private updateDisplay(): void {
        const elements = {
            bindMoveLeft: document.getElementById("bindMoveLeft") as HTMLElement,
            bindMoveRight: document.getElementById("bindMoveRight") as HTMLElement,
            bindMoveUp: document.getElementById("bindMoveUp") as HTMLElement,
            bindMoveDown: document.getElementById("bindMoveDown") as HTMLElement,
            bindJump: document.getElementById("bindJump") as HTMLElement,
            bindMenu: document.getElementById("bindMenu") as HTMLElement,
            volumeLabel: document.getElementById("volumeLabel") as HTMLElement,
            volumeSlider: document.getElementById("volumeSlider") as HTMLInputElement,
            fullscreenToggle: document.getElementById("fullscreenToggle") as HTMLInputElement,
            fpsToggle: document.getElementById("fpsToggle") as HTMLInputElement,
            contrastToggle: document.getElementById("contrastToggle") as HTMLInputElement
        };

        // Check for missing elements
        const missingElements = Object.entries(elements)
            .filter(([key, element]) => !element)
            .map(([key]) => key);

        if (missingElements.length > 0) {
            console.warn(`Missing elements in updateDisplay: ${missingElements.join(', ')}`);
            return;
        }

        // Update display elements safely
        elements.bindMoveLeft.textContent = this.settings.keyBindings.moveLeft;
        elements.bindMoveRight.textContent = this.settings.keyBindings.moveRight;
        elements.bindMoveUp.textContent = this.settings.keyBindings.moveUp;
        elements.bindMoveDown.textContent = this.settings.keyBindings.moveDown;
        elements.bindJump.textContent = this.settings.keyBindings.jump;
        elements.bindMenu.textContent = this.settings.keyBindings.menu;
        elements.volumeLabel.textContent = this.settings.volume + "%";
        elements.volumeSlider.value = this.settings.volume.toString();
        elements.fullscreenToggle.checked = this.settings.fullscreen;
        elements.fpsToggle.checked = this.settings.fpsDisplay;
        elements.contrastToggle.checked = this.settings.highContrast;
    }

    private loadSettings(): Settings {
        const saved = localStorage.getItem("princeTsSettings");
        if (saved) {
            try {
                const loaded = JSON.parse(saved);
                return { ...this.defaultSettings, ...loaded };
            } catch (e) {
                console.warn("Failed to load settings, using defaults");
            }
        }
        return { ...this.defaultSettings };
    }

    private saveSettings(): void {
        localStorage.setItem("princeTsSettings", JSON.stringify(this.settings));
    }

    public open(): void {
        this.overlay.style.display = "block";
        this.updateDisplay();
    }

    public close(): void {
        this.overlay.style.display = "none";
    }

    public getSettings(): Settings {
        return { ...this.settings };
    }

    public updateKeyBinding(action: string, keyCode: string): void {
        this.settings.keyBindings[action] = keyCode;
        this.saveSettings();
    }
} 