export interface Link {
    id: string;
    from: string;
    to: string;
    type: string;
    properties: Record<string, any>;
}
export declare class LinkTool {
    private links;
    private isLinking;
    private linkingFrom;
    private linkingType;
    constructor();
    private setupEventListeners;
    startLink(fromEntityId: string, linkType: string): void;
    cancelLink(): void;
    completeLink(toEntityId: string): boolean;
    private handleGlobalClick;
    private validateLink;
    private getDefaultLinkProperties;
    private generateLinkId;
    private updateLinkingUI;
    private updateEntityHighlighting;
    private getValidTargets;
    getLinks(): Link[];
    getLinksFrom(entityId: string): Link[];
    getLinksTo(entityId: string): Link[];
    getLink(linkId: string): Link | undefined;
    removeLink(linkId: string): boolean;
    removeLinksFrom(entityId: string): number;
    removeLinksTo(entityId: string): number;
    updateLinkProperties(linkId: string, properties: Record<string, any>): void;
    getLinkProperties(linkId: string): Record<string, any> | undefined;
    isLinkingActive(): boolean;
    getLinkingInfo(): {
        from: string | null;
        type: string | null;
    };
    exportLinks(): Record<string, Link>;
    importLinks(links: Record<string, Link>): void;
    clear(): void;
    getLinkCount(): number;
    getLinksByType(linkType: string): Link[];
    validateAllLinks(): {
        valid: Link[];
        invalid: Link[];
    };
    getLinkTypes(): string[];
    getSupportedLinkTypes(): string[];
    getLinkTypeDescription(linkType: string): string;
}
//# sourceMappingURL=LinkTool.d.ts.map