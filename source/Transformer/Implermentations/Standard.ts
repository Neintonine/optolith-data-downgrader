import {TranslatedProperty, Transformer, OriginalFile} from "../Transformer";
import {Property} from "../../Translations/Property";

export class Standard implements Transformer {
    
    public getValue(data: OriginalFile, property: Property): TranslatedProperty {
        const universalValue = data[property.propertyFrom];
        
        if (property.universal) {
            return { universal: universalValue }
        }
        
        const result: TranslatedProperty = {};
        for (let langkey in data['translations']) {
            result[langkey] = data['translations'][langkey][property.propertyFrom] ?? universalValue;
        }
        
        return result;
    }
}