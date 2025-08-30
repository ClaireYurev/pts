import { Renderer } from "../engine/Renderer.js";
import { InputHandler } from "../engine/InputHandler.js";

export class FreeCamera {
  public enabled = false;
  private camX = 0;
  private camY = 0;
  private speed = 300;
  private sprintMultiplier = 3;

  constructor(private renderer: Renderer) {}

  public update(input: InputHandler, dt: number): void {
    if (!this.enabled) return;

    let dx = 0, dy = 0;
    const currentSpeed = this.speed * (input.isKeyDown("ShiftLeft") ? this.sprintMultiplier : 1);

    // Numpad controls: 4=left, 6=right, 8=up, 2=down
    if (input.isKeyDown("Numpad4")) dx -= currentSpeed * dt;
    if (input.isKeyDown("Numpad6")) dx += currentSpeed * dt;
    if (input.isKeyDown("Numpad8")) dy -= currentSpeed * dt;
    if (input.isKeyDown("Numpad2")) dy += currentSpeed * dt;

    this.camX += dx;
    this.camY += dy;

    this.renderer.setCamera(this.camX, this.camY);
  }

  public toggle(): void {
    this.enabled = !this.enabled;
    console.log(`Free camera ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  public setPosition(x: number, y: number): void {
    this.camX = x;
    this.camY = y;
    this.renderer.setCamera(this.camX, this.camY);
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.camX, y: this.camY };
  }

  public resetToPlayer(playerX: number, playerY: number, canvasWidth: number, canvasHeight: number): void {
    this.camX = playerX - canvasWidth / 2;
    this.camY = playerY - canvasHeight / 2;
    this.renderer.setCamera(this.camX, this.camY);
  }
} 