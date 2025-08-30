import { CheatFlag } from "./CheatManager.js";
export class DevPanel {
    constructor(cheatManager, freeCamera, debugOverlay, engine) {
        this.visible = false;
        this.resetConfirmationActive = false;
        this.resetConfirmationTimeout = null;
        this.cheatManager = cheatManager;
        this.freeCamera = freeCamera;
        this.debugOverlay = debugOverlay;
        this.engine = engine;
        this.panel = this.createPanel();
        this.setupEventListeners();
    }
    createPanel() {
        const panel = document.createElement('div');
        panel.id = 'devPanel';
        panel.style.cssText = `
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      background: rgba(0, 0, 0, 0.9);
      color: #0f0;
      padding: 15px;
      z-index: 1001;
      font-family: monospace;
      font-size: 12px;
      border-top: 2px solid #0f0;
      border-right: 2px solid #0f0;
      max-height: 300px;
      overflow-y: auto;
    `;
        panel.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #0f0; padding-bottom: 5px;">
        DEV PANEL (Press \` to toggle)
      </div>
      
      <div style="margin-bottom: 15px;">
        <h4 style="margin: 5px 0; color: #ff0;">Cheats</h4>
        <label style="display: block; margin: 2px 0;">
          <input type="checkbox" id="cheatGod"> God Mode
        </label>
        <label style="display: block; margin: 2px 0;">
          <input type="checkbox" id="cheatNoClip"> No Clip
        </label>
        <label style="display: block; margin: 2px 0;">
          <input type="checkbox" id="cheatInfTime"> Infinite Time
        </label>
        <label style="display: block; margin: 2px 0;">
          <input type="checkbox" id="cheatGiveSword"> Give Sword
        </label>
        <label style="display: block; margin: 2px 0;">
          Set Health: <input type="number" id="cheatHealth" value="100" min="0" max="999" style="width: 60px; background: #000; color: #0f0; border: 1px solid #0f0;">
        </label>
        <button id="cheatApply" style="margin: 5px 0; background: #000; color: #0f0; border: 1px solid #0f0; padding: 3px 8px; cursor: pointer;">Apply Cheats</button>
        <button id="cheatReset" style="margin: 5px 0; margin-left: 5px; background: #000; color: #f00; border: 1px solid #f00; padding: 3px 8px; cursor: pointer;">Reset All</button>
      </div>

      <div style="margin-bottom: 15px;">
        <h4 style="margin: 5px 0; color: #ff0;">Debug Tools</h4>
        <label style="display: block; margin: 2px 0;">
          <input type="checkbox" id="debugOverlay"> Debug Overlay
        </label>
        <label style="display: block; margin: 2px 0;">
          <input type="checkbox" id="freeCamera"> Free Camera
        </label>
        <button id="resetCamera" style="margin: 5px 0; background: #000; color: #0f0; border: 1px solid #0f0; padding: 3px 8px; cursor: pointer;">Reset Camera</button>
      </div>

      <div style="margin-bottom: 15px;">
        <h4 style="margin: 5px 0; color: #ff0;">Game Control</h4>
        <button id="resetGame" style="margin: 5px 0; background: #8B0000; color: #fff; border: 1px solid #DC143C; padding: 3px 8px; cursor: pointer;">Reset Game</button>
      </div>

      <div style="margin-bottom: 15px;">
        <h4 style="margin: 5px 0; color: #ff0;">Active Cheats</h4>
        <div id="activeCheats" style="font-size: 10px; color: #0a0;"></div>
      </div>
    `;
        document.body.appendChild(panel);
        return panel;
    }
    setupEventListeners() {
        // Toggle panel with backtick key
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Backquote') {
                this.toggle();
            }
        });
        // Apply cheats button
        document.getElementById('cheatApply').addEventListener('click', () => {
            this.applyCheats();
        });
        // Reset cheats button
        document.getElementById('cheatReset').addEventListener('click', () => {
            this.cheatManager.resetAll();
            this.updateActiveCheatsDisplay();
        });
        // Debug overlay toggle
        document.getElementById('debugOverlay').addEventListener('change', (e) => {
            const target = e.target;
            if (target.checked) {
                this.debugOverlay.enabled = true;
            }
            else {
                this.debugOverlay.enabled = false;
            }
        });
        // Free camera toggle
        document.getElementById('freeCamera').addEventListener('change', (e) => {
            const target = e.target;
            if (target.checked) {
                this.freeCamera.enabled = true;
            }
            else {
                this.freeCamera.enabled = false;
                // Reset camera to player when disabling
                const player = this.engine.getEntities()[0];
                if (player) {
                    this.freeCamera.resetToPlayer(player.position.x, player.position.y, this.engine.canvas.width, this.engine.canvas.height);
                }
            }
        });
        // Reset camera button
        document.getElementById('resetCamera').addEventListener('click', () => {
            const player = this.engine.getEntities()[0];
            if (player) {
                this.freeCamera.resetToPlayer(player.position.x, player.position.y, this.engine.canvas.width, this.engine.canvas.height);
            }
        });
        // Reset game button
        document.getElementById('resetGame').addEventListener('click', () => {
            this.handleResetGame();
        });
    }
    applyCheats() {
        const god = document.getElementById('cheatGod').checked;
        const noclip = document.getElementById('cheatNoClip').checked;
        const infTime = document.getElementById('cheatInfTime').checked;
        const giveSword = document.getElementById('cheatGiveSword').checked;
        const health = Number(document.getElementById('cheatHealth').value);
        this.cheatManager.setCheat(CheatFlag.GodMode, god);
        this.cheatManager.setCheat(CheatFlag.NoClip, noclip);
        this.cheatManager.setCheat(CheatFlag.InfiniteTime, infTime);
        this.cheatManager.setCheat(CheatFlag.GiveSword, giveSword);
        this.cheatManager.setCheat(CheatFlag.SetHealth, health);
        // Apply health immediately if set
        if (health > 0) {
            const player = this.engine.getEntities()[0];
            if (player) {
                player.health = health;
            }
        }
        this.updateActiveCheatsDisplay();
    }
    updateActiveCheatsDisplay() {
        const activeCheatsDiv = document.getElementById('activeCheats');
        const activeCheats = this.cheatManager.getActiveCheats();
        if (activeCheats.length === 0) {
            activeCheatsDiv.textContent = 'None';
        }
        else {
            activeCheatsDiv.textContent = activeCheats.join(', ');
        }
    }
    toggle() {
        this.visible = !this.visible;
        this.panel.style.display = this.visible ? 'block' : 'none';
        if (this.visible) {
            this.updateActiveCheatsDisplay();
            this.syncCheckboxes();
        }
    }
    syncCheckboxes() {
        // Sync checkboxes with current cheat states
        document.getElementById('cheatGod').checked = this.cheatManager.isActive(CheatFlag.GodMode);
        document.getElementById('cheatNoClip').checked = this.cheatManager.isActive(CheatFlag.NoClip);
        document.getElementById('cheatInfTime').checked = this.cheatManager.isActive(CheatFlag.InfiniteTime);
        document.getElementById('cheatGiveSword').checked = this.cheatManager.isActive(CheatFlag.GiveSword);
        const healthValue = this.cheatManager.getValue(CheatFlag.SetHealth);
        if (healthValue !== null) {
            document.getElementById('cheatHealth').value = healthValue.toString();
        }
        // Sync debug tools
        document.getElementById('debugOverlay').checked = this.debugOverlay.enabled;
        document.getElementById('freeCamera').checked = this.freeCamera.enabled;
    }
    update() {
        if (this.visible) {
            this.updateActiveCheatsDisplay();
        }
    }
    handleResetGame() {
        if (!this.resetConfirmationActive) {
            // First click - activate confirmation
            this.resetConfirmationActive = true;
            const resetBtn = document.getElementById('resetGame');
            resetBtn.textContent = 'Click again to confirm reset';
            resetBtn.style.backgroundColor = '#DC143C';
            resetBtn.style.borderColor = '#FF0000';
            // Set timeout to reset confirmation after 3 seconds
            this.resetConfirmationTimeout = window.setTimeout(() => {
                this.resetConfirmationActive = false;
                resetBtn.textContent = 'Reset Game';
                resetBtn.style.backgroundColor = '#8B0000';
                resetBtn.style.borderColor = '#DC143C';
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
            const resetBtn = document.getElementById('resetGame');
            resetBtn.textContent = 'Reset Game';
            resetBtn.style.backgroundColor = '#8B0000';
            resetBtn.style.borderColor = '#DC143C';
            // Perform the actual reset
            this.performGameReset();
        }
    }
    performGameReset() {
        try {
            // Clear all save data if save manager is available
            const saveManager = this.engine.getPauseManager(); // This is a workaround since we don't have direct access to save manager
            // Reload the page to reset the game state
            window.location.reload();
        }
        catch (error) {
            console.error('Error during game reset:', error);
            alert('Failed to reset game. Please refresh the page manually.');
        }
    }
}
//# sourceMappingURL=DevPanel.js.map