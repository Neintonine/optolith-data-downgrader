export default class TranslationNotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "TranslationNotFoundError"
    }
}