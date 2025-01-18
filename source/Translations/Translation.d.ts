interface TranslationOptions {
    targetName: string,
    dependsOn: string[],
}

interface LoadedTranslation extends Nullable<TranslationOptions> {
    properties: Array<LoadedProperty>
}

interface Translation extends TranslationOptions {
    properties: Array<Property>
}