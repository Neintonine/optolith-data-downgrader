import * as fs from "node:fs";
import path from "node:path";
import TranslationNotFoundError from "./TranslationNotFoundError";
import {LoadedProperty, Property} from "./Property";

export default class TranslationContainer {

    private readonly translationPath: string
    
    constructor(
        translations: string
    ) {
        this.translationPath = path.resolve(translations);
    }
    
    public loadTranslation(type: string): Translation {
        const filePath: string = path.join(this.translationPath, type + '.json');
        if (!fs.existsSync(filePath)) {
            throw new TranslationNotFoundError(`Could not find translation for ${type} under: ${filePath}`)
        }
        
        const fileContent: string = fs.readFileSync(filePath).toString();
        const loadedTranslation: LoadedTranslation = JSON.parse(fileContent);
        
        return this.cleanLoadedTranslation(loadedTranslation, type);
    }
    
    private cleanLoadedTranslation(
        loadedTranslation: LoadedTranslation,
        translationName: string
    ): Translation {
        return {
            transformer: loadedTranslation.transformer ?? 'Standard',
            targetName: loadedTranslation.targetName ?? translationName,
            dependsOn: loadedTranslation.dependsOn ?? [],
            properties: loadedTranslation.properties.map((property: LoadedProperty): Property => {
                const from = Array.isArray(property.property) ? property.property[0] : property.property;
                const to = Array.isArray(property.property) ? property.property[1] : property.property;
                
                return {
                    propertyFrom: from,
                    propertyTo: to,
                    universal: property.universal ?? false,
                    modifier: property.modifier ?? {},
                }
            })
        }
    }
}