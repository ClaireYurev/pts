import { EditorApp } from './EditorApp.js';
declare class EditorMain {
    private editorApp;
    constructor();
    private initializeEditor;
    private createEditorApp;
    private setupEditorErrorHandling;
    private setupPerformanceMonitoring;
    private updateStatus;
    private updateFPS;
    private showError;
    getEditorApp(): EditorApp | null;
}
declare const editorMain: EditorMain;
export { editorMain, EditorMain };
//# sourceMappingURL=EditorMain.d.ts.map