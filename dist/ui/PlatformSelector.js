import { PlatformManager } from "../engine/PlatformConfig.js";
export class PlatformSelector {
    constructor() {
        this.isVisible = false;
        this.eventListeners = [];
        this.abortController = new AbortController();
        this.overlay = this.createOverlay();
        this.setupEventListeners();
    }
    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'platformSelectorOverlay';
        overlay.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%);
            z-index: 2000;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff;
            overflow-y: auto;
            backdrop-filter: blur(10px);
            justify-content: center;
            align-items: center;
        `;
        overlay.innerHTML = `
            <div class="platform-selector-container">
                <div class="platform-selector-header">
                    <h1 class="platform-selector-title">
                        <span class="title-icon">🎮</span>
                        Prince of Persia Platform Selector
                    </h1>
                    <p class="platform-selector-subtitle">
                        Choose your preferred platform to experience Prince of Persia in its original resolution and style
                    </p>
                </div>
                
                <div class="platform-selector-controls">
                    <div class="category-filters">
                        <button class="category-btn active" data-category="all">
                            <span class="category-icon">🌟</span>
                            All Platforms
                        </button>
                        <button class="category-btn" data-category="computer">
                            <span class="category-icon">🖥️</span>
                            Computers
                        </button>
                        <button class="category-btn" data-category="console">
                            <span class="category-icon">🎮</span>
                            Consoles
                        </button>
                        <button class="category-btn" data-category="handheld">
                            <span class="category-icon">📱</span>
                            Handhelds
                        </button>
                    </div>
                    

                </div>

                <div class="platform-grid" id="platformGrid"></div>

                <div class="platform-selector-footer">
                    <button id="closePlatformSelector" class="close-btn">
                        <span class="close-icon">✕</span>
                        Close
                    </button>
                </div>
            </div>
        `;
        // Add enhanced styles
        const style = document.createElement('style');
        style.textContent = `
            #platformSelectorOverlay {
                justify-content: center !important;
                align-items: center !important;
                padding: 20px;
                box-sizing: border-box;
            }
            .platform-selector-container {
                position: relative;
                background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
                border: 2px solid #4a90e2;
                border-radius: 20px;
                padding: 30px;
                max-width: 1200px;
                max-height: 85vh;
                width: 90vw;
                min-height: 400px;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                animation: slideIn 0.3s ease-out;
                box-sizing: border-box;
            }

            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            .platform-selector-header {
                text-align: center;
                margin-bottom: 30px;
            }

            .platform-selector-title {
                font-size: 2.5em;
                font-weight: 700;
                margin: 0 0 10px 0;
                background: linear-gradient(45deg, #ffd700, #ffed4e, #ffd700);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
            }

            .title-icon {
                display: inline-block;
                animation: bounce 2s infinite;
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                40% { transform: translateY(-10px); }
                60% { transform: translateY(-5px); }
            }

            .platform-selector-subtitle {
                font-size: 1.1em;
                color: #b8c5d6;
                margin: 0;
                font-weight: 300;
            }

            .platform-selector-controls {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 30px;
                flex-wrap: wrap;
                gap: 15px;
            }

            .category-filters {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .category-btn {
                background: linear-gradient(145deg, #2a2a4a, #1a1a3a);
                color: #fff;
                border: 2px solid #4a90e2;
                padding: 15px 25px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 15px;
                font-weight: 600;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                min-width: 140px;
                justify-content: center;
            }

            .category-btn:hover {
                background: linear-gradient(145deg, #3a3a5a, #2a2a4a);
                border-color: #5ba0f2;
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            }

            .category-btn.active {
                background: linear-gradient(145deg, #4a90e2, #357abd);
                border-color: #5ba0f2;
                box-shadow: 0 6px 12px rgba(74, 144, 226, 0.4);
            }

            .category-icon {
                font-size: 16px;
            }



            .platform-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 35px;
                margin-bottom: 30px;
                justify-items: center;
            }

            .platform-card {
                background: linear-gradient(145deg, #2a2a4a, #1a1a3a);
                border: 2px solid #4a90e2;
                border-radius: 15px;
                padding: 20px;
                cursor: pointer;
                width: 100%;
                max-width: 260px;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                margin: 0 auto;
            }

            .platform-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transition: left 0.5s ease;
            }

            .platform-card:hover::before {
                left: 100%;
            }

            .platform-card:hover {
                background: linear-gradient(145deg, #3a3a5a, #2a2a4a);
                border-color: #5ba0f2;
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
            }

            .platform-card.selected {
                border-color: #ffd700;
                background: linear-gradient(145deg, #3a3a5a, #2a2a4a);
                box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }

            .platform-card h3 {
                margin: 0 0 15px 0;
                color: #ffd700;
                font-size: 18px;
                font-weight: 700;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                text-align: center;
            }

            .platform-card .resolution {
                color: #4ade80;
                font-weight: bold;
                font-size: 16px;
                margin-bottom: 10px;
                font-family: 'Courier New', monospace;
                text-align: center;
            }

            .platform-card .year {
                color: #fbbf24;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
                text-align: center;
            }

            .platform-card .colors {
                color: #f87171;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 12px;
                text-align: center;
            }

            .platform-card .features {
                color: #b8c5d6;
                font-size: 11px;
                line-height: 1.3;
                text-align: center;
                margin-top: 4px;
            }

            .platform-card .features span {
                background: linear-gradient(145deg, #4a90e2, #357abd);
                color: white;
                padding: 3px 6px;
                border-radius: 10px;
                margin-right: 4px;
                margin-bottom: 4px;
                display: inline-block;
                font-weight: 500;
                font-size: 10px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }

            .platform-selector-footer {
                text-align: center;
            }

            .close-btn {
                background: linear-gradient(145deg, #dc3545, #c82333);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 25px;
                cursor: pointer;
                font-size: 16px;
                font-weight: 600;
                transition: all 0.3s ease;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }

            .close-btn:hover {
                background: linear-gradient(145deg, #e74c3c, #dc3545);
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
            }

            .close-icon {
                font-size: 18px;
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .platform-selector-container {
                    margin: 10px;
                    padding: 20px;
                    width: calc(100vw - 20px);
                    max-width: none;
                }

                .platform-selector-title {
                    font-size: 2em;
                }

                .platform-selector-controls {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 20px;
                }

                .category-filters {
                    justify-content: center;
                    gap: 10px;
                }

                .category-btn {
                    padding: 12px 20px;
                    font-size: 14px;
                    min-width: 120px;
                }

                .platform-grid {
                    grid-template-columns: 1fr;
                    gap: 30px;
                }

                .platform-card {
                    max-width: none;
                    padding: 20px;
                }
            }

            /* Scrollbar styling */
            .platform-selector-container::-webkit-scrollbar {
                width: 8px;
            }

            .platform-selector-container::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }

            .platform-selector-container::-webkit-scrollbar-thumb {
                background: linear-gradient(145deg, #4a90e2, #357abd);
                border-radius: 4px;
            }

            .platform-selector-container::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(145deg, #5ba0f2, #4a90e2);
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
        return overlay;
    }
    setupEventListeners() {
        // Category filter buttons
        const categoryBtns = this.overlay.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            const categoryClickHandler = (e) => {
                const target = e.target;
                const category = target.dataset.category;
                // Update active button
                categoryBtns.forEach(b => b.classList.remove('active'));
                target.classList.add('active');
                // Filter platforms
                this.renderPlatforms(category);
            };
            btn.addEventListener('click', categoryClickHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: btn, type: 'click', listener: categoryClickHandler });
        });
        // Close button
        const closeBtn = this.overlay.querySelector('#closePlatformSelector');
        if (closeBtn) {
            const closeHandler = () => this.hide();
            closeBtn.addEventListener('click', closeHandler, { signal: this.abortController.signal });
            this.eventListeners.push({ element: closeBtn, type: 'click', listener: closeHandler });
        }
        // Close on overlay click
        const overlayClickHandler = (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        };
        this.overlay.addEventListener('click', overlayClickHandler, { signal: this.abortController.signal });
        this.eventListeners.push({ element: this.overlay, type: 'click', listener: overlayClickHandler });
        // Keyboard shortcuts
        const keydownHandler = (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        };
        document.addEventListener('keydown', keydownHandler, { signal: this.abortController.signal });
        this.eventListeners.push({ element: document, type: 'keydown', listener: keydownHandler });
    }
    renderPlatforms(category = 'all') {
        const grid = this.overlay.querySelector('#platformGrid');
        if (!grid)
            return;
        grid.innerHTML = '';
        let platforms;
        if (category === 'all') {
            platforms = PlatformManager.getAllPlatforms();
        }
        else {
            platforms = PlatformManager.getPlatformsByCategory(category);
        }
        // Sort by year, then by name
        platforms.sort((a, b) => {
            if (a.year !== b.year)
                return a.year - b.year;
            return a.name.localeCompare(b.name);
        });
        platforms.forEach((platform, index) => {
            const card = this.createPlatformCard(platform);
            // Add staggered animation
            card.style.animationDelay = `${index * 0.1}s`;
            grid.appendChild(card);
        });
    }
    createPlatformCard(platform) {
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.dataset.platformKey = this.getPlatformKey(platform);
        // Add animation class
        card.style.animation = 'slideIn 0.3s ease-out forwards';
        card.style.opacity = '0';
        card.innerHTML = `
            <h3>${platform.name}</h3>
            <div class="resolution">${platform.resolution.width} × ${platform.resolution.height}</div>
            <div class="year">📅 ${platform.year}</div>
            <div class="colors">🎨 ${platform.colors} colors</div>
            <div class="features">
                ${platform.features.map(feature => `<span>${feature}</span>`).join('')}
            </div>
        `;
        card.addEventListener('click', () => {
            const platformKey = card.dataset.platformKey;
            if (platformKey && this.onPlatformChange) {
                // Add click animation
                card.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    card.style.transform = '';
                    if (this.onPlatformChange) {
                        this.onPlatformChange(platformKey);
                    }
                    this.hide();
                    // Also close any open Pi Menu to prevent it from remaining visible
                    if (this.piMenu) {
                        this.piMenu.close();
                    }
                    else {
                        // Fallback: directly hide the Pi Menu overlay
                        const piMenuOverlay = document.getElementById('piMenuOverlay');
                        if (piMenuOverlay && piMenuOverlay.style.display !== 'none') {
                            piMenuOverlay.style.display = 'none';
                        }
                    }
                }, 150);
            }
        });
        return card;
    }
    getPlatformKey(platform) {
        const platforms = PlatformManager.getAllPlatforms();
        const index = platforms.findIndex(p => p.name === platform.name);
        return PlatformManager.getPlatformKeys()[index] || 'snes';
    }
    show() {
        this.isVisible = true;
        this.overlay.style.display = 'flex';
        this.renderPlatforms('all');
        // Pause the game when platform selector is shown
        if (this.pauseManager) {
            this.pauseManager.pause();
        }
        // Focus management removed - search functionality was removed
    }
    hide() {
        this.isVisible = false;
        this.overlay.style.display = 'none';
        // Resume the game when platform selector is hidden
        if (this.pauseManager) {
            this.pauseManager.resume();
        }
        // Ensure Pi Menu is also closed to prevent it from remaining visible
        const piMenuOverlay = document.getElementById('piMenuOverlay');
        if (piMenuOverlay && piMenuOverlay.style.display !== 'none') {
            piMenuOverlay.style.display = 'none';
        }
    }
    toggle() {
        if (this.isVisible) {
            this.hide();
        }
        else {
            this.show();
        }
    }
    setPlatformChangeCallback(callback) {
        this.onPlatformChange = callback;
    }
    setPauseManager(pauseManager) {
        this.pauseManager = pauseManager;
    }
    setPiMenu(piMenu) {
        this.piMenu = piMenu;
    }
    isPlatformSelectorVisible() {
        return this.isVisible;
    }
    cleanup() {
        try {
            // Abort all event listeners using AbortController
            this.abortController.abort();
            // Fallback: manually remove all event listeners
            for (const { element, type, listener } of this.eventListeners) {
                try {
                    element.removeEventListener(type, listener);
                }
                catch (error) {
                    console.warn(`Failed to remove event listener for ${type}:`, error);
                }
            }
            this.eventListeners = [];
            // Remove overlay from DOM
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            console.log("PlatformSelector cleanup completed successfully");
        }
        catch (error) {
            console.error("Error during PlatformSelector cleanup:", error);
        }
    }
    updateZIndexForFullscreen(isFullscreen) {
        if (this.overlay) {
            this.overlay.style.zIndex = isFullscreen ? '9999' : '2000';
        }
        console.log(`PlatformSelector z-index updated for fullscreen: ${isFullscreen}`);
    }
}
//# sourceMappingURL=PlatformSelector.js.map