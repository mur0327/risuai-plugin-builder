/**
 * RisuAI Plugin API Type Definitions
 * Version: 3.0
 *
 * This file provides TypeScript type definitions for the RisuAI Plugin API v3.0.
 * All API methods are accessed through the global `risuai` or `Risuai` object.
 *
 * @important **ALL METHODS RETURN PROMISES**
 *
 * Due to the iframe-based sandboxing architecture, ALL method calls go through
 * postMessage communication, which makes them asynchronous. Even methods that
 * appear synchronous in the implementation return Promises when called from the plugin iframe.
 *
 * For DOM, we recommend using iframe-based UI which uses standard document API
 * instead of accessing the main document directly via getRootDocument(),
 * unless absolutely necessary.
 *
 * **ALWAYS use `await` or `.then()` when calling any risuai method or SafeElement method.**
 */

// ============================================================================
// MCP Types
// ============================================================================

/**
 * MCP tool definition
 */
interface MCPToolDef {
    /** Tool name */
    name: string;
    /** Tool description */
    description: string;
    /** JSON schema for input validation */
    inputSchema: any;
    /** Annotations for the tool, can be used for documentation or metadata */
    annotations?: any;
}

/**
 * Text content returned from an MCP tool call
 */
interface MCPToolCallTextContent {
    type: 'text';
    text: string;
}

/**
 * Image or audio content returned from an MCP tool call
 */
interface MCPToolCallImageAudioContent {
    type: 'image' | 'audio';
    /** Base64 encoded data */
    data: string;
    /** e.g. 'image/png', 'image/jpeg' */
    mimeType: string;
}

/**
 * Resource content returned from an MCP tool call
 */
interface MCPToolCallResourceContent {
    type: 'resource';
    resource: {
        uri: string;
        mimeType: string;
        text: string;
    };
}

/**
 * Content types that can be returned from an MCP tool call
 */
type MCPToolCallContent = MCPToolCallTextContent | MCPToolCallImageAudioContent | MCPToolCallResourceContent;

// ============================================================================
// Core Types
// ============================================================================

/**
 * OpenAI-format chat message
 */
interface OpenAIChat {
    role: 'system' | 'user' | 'assistant' | 'function';
    content: string;
    name?: string;
    function_call?: {
        name: string;
        arguments: string;
    };
}

/**
 * Returned response for UI part registration
 */
interface UIPartResponse {
    id: string;
}

/**
 * Container display mode
 */
type ContainerMode = 'fullscreen';

/**
 * Icon type for UI elements
 */
type IconType = 'html' | 'img' | 'none';

/**
 * Script handler mode
 */
type ScriptMode = 'display' | 'output' | 'input' | 'process';

/**
 * Replacer type
 */
type ReplacerType = 'beforeRequest' | 'afterRequest';

/**
 * Risuai Plugin definition
 */
interface RisuPlugin {
    /** Plugin name (identifier) */
    name: string;
    /** Display name shown in UI */
    displayName?: string;
    /** Plugin script code */
    script: string;
    /** Argument type definitions */
    arguments: { [key: string]: 'int' | 'string' | string[] };
    /** Actual argument values */
    realArg: { [key: string]: number | string };
    /** API version */
    version?: 1 | 2 | '2.1' | '3.0';
    /** Custom links for plugin UI */
    customLink: {
        link: string;
        hoverText?: string;
    }[];
    /** Argument metadata */
    argMeta: { [key: string]: { [key: string]: string } };
    /** Plugin version string */
    versionOfPlugin?: string;
    /** Update check URL */
    updateURL?: string;
}

/**
 * Risuai Module definition
 */
interface RisuModule {
    /** Module name */
    name: string;
    /** Module description */
    description: string;
    /** Lorebook entries */
    lorebook?: any[];
    /** Regex scripts */
    regex?: any[];
    /** CommonJS code */
    cjs?: string;
    /** Trigger scripts */
    trigger?: any[];
    /** Module ID */
    id: string;
    /** Low level system access */
    lowLevelAccess?: boolean;
    /** Hide icon in UI */
    hideIcon?: boolean;
    /** Background embedding */
    backgroundEmbedding?: string;
    /** Module assets */
    assets?: [string, string, string][];
    /** Module namespace */
    namespace?: string;
    /** Custom module toggle */
    customModuleToggle?: string;
    /** MCP module configuration */
    mcp?: any;
}

/**
 * User persona definition
 */
interface Persona {
    /** Persona prompt/description */
    personaPrompt: string;
    /** Persona name */
    name: string;
    /** Persona icon */
    icon: string;
    /** Use large portrait */
    largePortrait?: boolean;
    /** Persona ID */
    id?: string;
    /** Persona note */
    note?: string;
}

/**
 * Database subset with limited access to allowed keys only.
 * Plugins can only access these specific database properties for security.
 */
interface DatabaseSubset {
    /** Array of characters and group chats */
    characters?: any[];
    /** Risuai modules */
    modules?: RisuModule[];
    /** Enabled module IDs */
    enabledModules?: string[];
    /** Module integration settings */
    moduleIntergration?: string;
    /** Plugin V2 instances */
    pluginV2?: RisuPlugin[];
    /** User personas */
    personas?: Persona[];
    /** Plugin instances */
    plugins?: RisuPlugin[];
    /** Plugin custom storage object */
    pluginCustomStorage?: { [key: string]: any };
    /** AI temperature setting (0-100) */
    temperature?: number;
    /** Ask before removing messages */
    askRemoval?: boolean;
    /** Maximum context tokens */
    maxContext?: number;
    /** Maximum response tokens */
    maxResponse?: number;
    /** Frequency penalty (0-100) */
    frequencyPenalty?: number;
    /** Presence penalty (0-100) */
    PresensePenalty?: number;
    /** UI theme name */
    theme?: string;
    /** Text theme name */
    textTheme?: string;
    /** Line height setting */
    lineHeight?: number;
    /** Use separate models for auxiliary models */
    seperateModelsForAxModels?: boolean;
    /** Separate model configurations */
    seperateModels?: {
        memory: string;
        emotion: string;
        translate: string;
        otherAx: string;
    };
    /** Custom CSS styles */
    customCSS?: string;
    /** Custom GUI HTML */
    guiHTML?: string;
    /** Color scheme name */
    colorSchemeName?: string;
    /** Character order */
    characterOrder?: any;
    /** Selected persona */
    selectedPersona?: any;
}

// ============================================================================
// SafeElement API
// ============================================================================

/**
 * SafeElement provides secure DOM manipulation with restricted access.
 * All methods are asynchronous.
 */
interface SafeElement {
    // Element Manipulation
    appendChild(child: SafeElement): Promise<void>;
    removeChild(child: SafeElement): Promise<void>;
    replaceChild(newChild: SafeElement, oldChild: SafeElement): Promise<void>;
    replaceWith(newElement: SafeElement): Promise<void>;
    cloneNode(deep?: boolean): Promise<SafeElement>;
    prepend(child: SafeElement): Promise<void>;
    remove(): Promise<void>;

    // Text Content
    innerText(): Promise<string>;
    textContent(): Promise<string | null>;
    setTextContent(value: string): Promise<void>;
    setInnerText(value: string): Promise<void>;

    // HTML Content (Auto-Sanitized with DOMPurify)
    getInnerHTML(): Promise<string>;
    getOuterHTML(): Promise<string>;
    setInnerHTML(value: string): Promise<void>;
    setOuterHTML(value: string): Promise<void>;

    // Attributes (only 'x-' prefixed allowed)
    setAttribute(name: string, value: string): Promise<void>;
    getAttribute(name: string): Promise<string | null>;

    // Styling
    setStyle(property: string, value: string): Promise<void>;
    getStyle(property: string): Promise<string>;
    getStyleAttribute(): Promise<string>;
    setStyleAttribute(value: string): Promise<void>;
    addClass(className: string): Promise<void>;
    removeClass(className: string): Promise<void>;
    setClassName(className: string): Promise<void>;
    getClassName(): Promise<string>;
    hasClass(className: string): Promise<boolean>;

    // Focus
    focus(): Promise<void>;

    // Traversal and Querying
    getChildren(): Promise<SafeElement[]>;
    getParent(): Promise<SafeElement | null>;
    querySelectorAll(selector: string): Promise<SafeElement[]>;
    querySelector(selector: string): Promise<SafeElement | null>;
    getElementById(id: string): Promise<SafeElement | null>;
    getElementsByClassName(className: string): Promise<SafeElement[]>;
    matches(selector: string): Promise<boolean>;

    // Dimensions and Position
    clientHeight(): Promise<number>;
    clientWidth(): Promise<number>;
    clientTop(): Promise<number>;
    clientLeft(): Promise<number>;
    getBoundingClientRect(): Promise<DOMRect>;
    getClientRects(): Promise<DOMRectList>;

    // Node Information
    nodeName(): Promise<string>;
    nodeType(): Promise<number>;

    // Event Listeners (returns ID for removal)
    addEventListener(
        type: string,
        listener: (event: any) => void,
        options?: boolean | AddEventListenerOptions
    ): Promise<string>;
    removeEventListener(
        type: string,
        id: string,
        options?: boolean | EventListenerOptions
    ): Promise<void>;

    // Scroll
    scrollIntoView(options?: boolean | ScrollIntoViewOptions): Promise<void>;
}

// ============================================================================
// SafeDocument API
// ============================================================================

/**
 * SafeDocument extends SafeElement with document-specific methods.
 * Note: Use iframe UI whenever possible. Additional restrictions might be added in the future.
 */
interface SafeDocument extends SafeElement {
    createElement(tagName: string): SafeElement;
    createAnchorElement(href: string): SafeElement;
}

// ============================================================================
// SafeClassArray
// ============================================================================

/**
 * SafeClassArray provides array-like access with async methods.
 */
interface SafeClassArray<T> {
    at(index: number): Promise<T | undefined>;
    length(): Promise<number>;
    push(item: T): Promise<void>;
}

// ============================================================================
// SafeMutationObserver
// ============================================================================

interface SafeMutationRecord {
    getType(): Promise<string>;
    getTarget(): Promise<SafeElement>;
    getAddedNodes(): Promise<SafeClassArray<SafeElement>>;
}

type SafeMutationCallback = (mutations: SafeClassArray<SafeMutationRecord>) => void;

interface SafeMutationObserver {
    observe(element: SafeElement, options: MutationObserverInit): Promise<void>;
}

// ============================================================================
// Storage APIs
// ============================================================================

/**
 * Plugin-specific storage that syncs with save files.
 * All methods return Promises.
 */
interface PluginStorage {
    getItem(key: string): Promise<any | null>;
    setItem(key: string, value: any): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    key(index: number): Promise<any | null>;
    keys(): Promise<string[]>;
    length(): Promise<number>;
}

/**
 * Device-local storage with generic type support.
 * Uses generic types for flexible value storage.
 * Storage is shared between all plugins under a common prefix.
 */
interface SafeLocalPluginStorage {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
}

/**
 * Device-specific storage shared between plugins.
 * All methods return Promises.
 */
interface SafeLocalStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear(): Promise<void>;
    key(index: number): Promise<string | null>;
    length(): Promise<number>;
}

// ============================================================================
// Provider API
// ============================================================================

interface ProviderArguments {
    prompt_chat: OpenAIChat[];
    temperature: number;
    max_tokens: number;
    frequency_penalty: number;
    min_p: number;
    presence_penalty: number;
    repetition_penalty: number;
    top_k: number;
    top_p: number;
    mode: string;
}

interface ProviderResponse {
    success: boolean;
    content: string | ReadableStream<string>;
}

type ProviderFunction = (
    args: ProviderArguments,
    abortSignal?: AbortSignal
) => Promise<ProviderResponse>;

interface ProviderOptions {
    tokenizer?: string;
    tokenizerFunc?: (content: string) => number[] | Promise<number[]>;
}

// ============================================================================
// Risuai Global API
// ============================================================================

/**
 * Risuai Plugin API v3.0
 * All methods are accessed through the global `risuai` or `Risuai` object.
 * All methods are asynchronous unless otherwise noted.
 */
interface RisuaiPluginAPI {
    // Version Information
    apiVersion: string;
    apiVersionCompatibleWith: string[];

    // Logging (deprecated - use console.log instead)
    log(message: string): Promise<void>;

    // Container Management
    showContainer(mode: ContainerMode): Promise<void>;
    hideContainer(): Promise<void>;

    // DOM Access
    getRootDocument(): Promise<SafeDocument>;
    createMutationObserver(callback: SafeMutationCallback): Promise<SafeMutationObserver>;

    // Character APIs
    getCharacter(): Promise<any>;
    setCharacter(character: any): Promise<void>;
    /** @deprecated Use getCharacter() instead */
    getChar(): Promise<any>;
    /** @deprecated Use setCharacter() instead */
    setChar(character: any): Promise<void>;

    /**
     * Gets a character by index
     * @param index - Character index
     * @returns Character object or null if not found
     */
    getCharacterFromIndex(index: number): Promise<any | null>;

    /**
     * Saves a character at a specific index
     * @param index - Character index
     * @param character - Character object to save
     */
    setCharacterToIndex(index: number, character: any): Promise<void>;

    /**
     * Gets a chat by index
     * @param characterIndex - Character index
     * @param chatIndex - Chat index
     * @returns Chat object or null if not found
     */
    getChatFromIndex(characterIndex: number, chatIndex: number): Promise<any | null>;

    /**
     * Saves a chat at a specific index
     * @param characterIndex - Character index
     * @param chatIndex - Chat index
     * @param chat - Chat object to save
     */
    setChatToIndex(characterIndex: number, chatIndex: number, chat: any): Promise<void>;

    /**
     * Gets the current character index
     * @returns Current character index
     */
    getCurrentCharacterIndex(): Promise<number>;

    /**
     * Gets the current chat index
     * @returns Current chat index
     */
    getCurrentChatIndex: () => Promise<number>;

    // Storage APIs
    pluginStorage: PluginStorage;
    safeLocalStorage: SafeLocalStorage;

    /**
     * Gets a device-local storage instance shared between plugins
     * @returns SafeLocalPluginStorage instance for device-local storage
     */
    getLocalPluginStorage(): Promise<SafeLocalPluginStorage>;

    // Argument APIs
    getArgument(key: string): Promise<string | number | undefined>;
    setArgument(key: string, value: string | number): Promise<void>;
    /** @deprecated Use getArgument() instead */
    getArg(arg: string): any;
    /** @deprecated Use setArgument() instead */
    setArg(arg: string, value: string | number): void;

    // Database APIs
    /**
     * Gets the database with limited access
     * @param includeOnly - Array of keys to include or 'all' for all allowed keys. Defaults to 'all'.
     * @returns DatabaseSubset object (limited to allowed keys) or null if consent not given
     */
    getDatabase(includeOnly?: string[] | 'all'): Promise<DatabaseSubset | null>;
    setDatabaseLite(db: DatabaseSubset): Promise<void>;
    setDatabase(db: DatabaseSubset): Promise<void>;

    // Network APIs
    nativeFetch(url: string, options?: RequestInit): Promise<Response>;

    // UI Registration
    registerSetting(
        name: string,
        callback: () => void | Promise<void>,
        icon?: string,
        iconType?: IconType
    ): Promise<UIPartResponse>;

    registerButton(
        arg: {
            name: string;
            icon: string;
            iconType: 'html' | 'img' | 'none';
            location?: 'action' | 'chat' | 'hamburger';
        },
        callback: () => void
    ): Promise<UIPartResponse>;

    unregisterUIPart(id: string): Promise<void>;

    // MCP APIs
    /**
     * Registers a custom MCP (Model Context Protocol) module
     * @param arg - MCP module configuration
     * @param getToolList - Function that returns the list of available tools
     * @param callTool - Function that handles tool invocations
     */
    registerMCP(
        arg: {
            identifier: string;
            name: string;
            version: string;
            description: string;
        },
        getToolList: () => Promise<MCPToolDef[]>,
        callTool: (toolName: string, content: any) => Promise<MCPToolCallContent[]>
    ): Promise<void>;

    /**
     * Unregisters a previously registered MCP module
     * @param identifier - The identifier used when registering the MCP module
     */
    unregisterMCP(identifier: string): Promise<void>;

    // Provider APIs
    addProvider(
        name: string,
        func: ProviderFunction,
        options?: ProviderOptions
    ): Promise<void>;

    // Script Handlers
    addRisuScriptHandler(
        mode: ScriptMode,
        func: (content: string) => string | null | undefined | Promise<string | null | undefined>
    ): Promise<void>;
    removeRisuScriptHandler(
        mode: ScriptMode,
        func: (content: string) => string | null | undefined | Promise<string | null | undefined>
    ): Promise<void>;

    // Replacers
    addRisuReplacer(
        type: 'beforeRequest',
        func: (messages: OpenAIChat[], type: string) => OpenAIChat[] | Promise<OpenAIChat[]>
    ): Promise<void>;
    addRisuReplacer(
        type: 'afterRequest',
        func: (content: string, type: string) => string | Promise<string>
    ): Promise<void>;
    removeRisuReplacer(type: ReplacerType, func: Function): Promise<void>;

    // Body Interceptors
    /**
     * Registers a body interceptor that can read and replace HTTP request bodies on LLM requests.
     * Sensitive fields like API keys are excluded from the body passed to the callback.
     * Requires 'replacer' permission.
     *
     * @param callback - Function that receives the request body and request type, and returns the modified body
     * @returns Object with an `id` for later unregistration, or null if permission was denied
     */
    registerBodyIntercepter(
        callback: (body: any, type: string) => any
    ): Promise<{ id: string } | null>;

    /**
     * Unregisters a previously registered body interceptor
     * @param id - The interceptor ID returned by registerBodyIntercepter
     */
    unregisterBodyIntercepter(id: string): Promise<void>;

    // Asset Management
    readImage(path?: string): Promise<any>;
    saveAsset(data: any): Promise<string>;

    // Plugin Management
    loadPlugins(): Promise<void>;
    onUnload(func: () => void | Promise<void>): Promise<void>;

    // Fetch Logs
    getFetchLogs(): Promise<{
        url: string;
        body: string;
        status?: number;
        response?: string;
        error?: string;
        timestamp: number;
    }[] | null>;

    // Utility
    checkCharOrder(): Promise<void>;
    getRuntimeInfo(): Promise<{
        apiVersion: string;
        platform: string;
        saveMethod: string;
    }>;

    /**
     * Requests permission for a specific action
     * @param permission - Permission string (e.g. 'fetchLogs'|'db'|'mainDom')
     * @returns True if permission granted, false otherwise
     */
    requestPluginPermission(permission: string): Promise<boolean>;

    unwarpSafeArray<T>(safeArray: SafeClassArray<T>): Promise<T[]>;

    // Translation Cache APIs
    /**
     * Searches the LLM translation cache for entries whose key contains the given partial key
     * @param partialKey - A substring to match against cache keys
     * @returns Array of matching cache entries with key and value
     */
    searchTranslationCache(partialKey: string): Promise<{key: string, value: string}[]>;

    /**
     * Gets a single entry from the LLM translation cache by exact key
     * @param key - The exact cache key to look up
     * @returns The cached translation or null if not found
     */
    getTranslationCache(key: string): Promise<string | null>;
}

// ============================================================================
// Global Declaration
// ============================================================================

declare global {
    const risuai: RisuaiPluginAPI;
    const Risuai: RisuaiPluginAPI;
}

export {};
