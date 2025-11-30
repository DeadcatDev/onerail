export interface Persistence {
    init(): Promise<void>;
    teardown(): Promise<void>;
}
