import * as category from './category'
import * as string from './string'
import * as activatable from './activatable'
import * as tree from "./tree"
import {DataLoader} from "../../Data/DataLoader";

export type ModifierContext = {
    currentValue: any,
    parameter: any,
    untransformedData: OriginalFile,
    language: string,
    dataLoader: DataLoader
}

export type Modifier = (context: ModifierContext) => any
export type ModifierStructure = Dictionary<Modifier>

export type ModifierDefinition = {
    [key: string]: unknown
}

export class Modifiers {
    private static MODIFIERS: Dictionary<ModifierStructure> = {
        category,
        string,
        activatable,
        tree
    }

    constructor(
        private readonly dataLoader: DataLoader
    ) {
    }


    async apply(data: OriginalFile, value: TranslatedProperty, language :string, requestedModifiers: ModifierDefinition): Promise<TranslatedProperty> {
        const context: ModifierContext = {
            untransformedData: data, 
            currentValue: value,
            parameter: null,
            language,
            dataLoader: this.dataLoader
        }

        for (const [name, parameter] of Object.entries(requestedModifiers)) {
            const [namespace, func] = name.split('.', 2);

            if (!(namespace in Modifiers.MODIFIERS)) {
                console.warn(`Couldn't find modifier namespace: ${namespace}`)
                continue;
            }

            const modifierNamespace = Modifiers.MODIFIERS[namespace];
            if (!(func in modifierNamespace)) {
                console.warn(`Couldn't find modifier under namespace "${namespace}": ${func}`)
                continue;
            }

            context.parameter = parameter;
            context.currentValue = await modifierNamespace[func](context);
        }
        
        return context.currentValue;
    }

}