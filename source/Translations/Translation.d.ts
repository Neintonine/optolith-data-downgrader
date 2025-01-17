interface TranslationOptions {
    targetName: string,
    dependsOn: string[],
    transformer: string,
}

interface LoadedTranslation extends Nullable<TranslationOptions> {
    properties: Array<LoadedProperty>
}

interface Translation extends TranslationOptions {
    properties: Array<Property>
}