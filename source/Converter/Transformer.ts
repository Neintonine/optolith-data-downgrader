import {ConverterContext} from "./Converter";
import {Property} from "../Translations/Property";

export class Transformer {
    public async convertEntry(context:ConverterContext): Promise<Entry> {
        const newData: Entry = new Map<string, TranslatedProperty>();
        for (const property of context.translation.properties) {
            const newPropertyValue = this.getValue(context.data, property);

            for (const [language, value] of Object.entries(newPropertyValue)) {
                newPropertyValue[language] = await context.modifiers.apply(context.data, value, language, property.modifier)
            }
            newData.set(property.propertyTo, newPropertyValue);
        }

        return newData;
    }

    private getValue(data: OriginalFile, property: Property): TranslatedProperty {
        const universalValue = data[property.propertyFrom];

        if (property.universal === true) {
            return { universal: universalValue }
        }

        const result: TranslatedProperty = {};
        if (property.universal === 'both') {
            result.universal = universalValue
        }

        for (const langkey in data['translations']) {
            result[langkey] = data['translations'][langkey][property.propertyFrom] ?? universalValue;
        }

        return result;
    }
}