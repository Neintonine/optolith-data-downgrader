export class UnknownTransformerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnknownTransformerError";
    }
}