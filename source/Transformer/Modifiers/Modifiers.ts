import {TranslatedProperty, OriginalFile} from "../Transformer";

export type ModifierContext = {
    currentValue: any, 
    parameter: any,
    untransformedData: OriginalFile,
}

export type Modifier = (context: ModifierContext) => any

export type ModifierDefinition = {
    [key: string]: any
}

export class Modifiers {
    private static MODIFIERS: Dictionary<Modifier> = {
        isCategory(context: ModifierContext) {
            if (!('category' in context.untransformedData)) {
                return false;
            }
            
            return context.untransformedData['category'] === context.parameter;
        }
    }
    
    apply(data: OriginalFile, value: TranslatedProperty, requestedModifiers: ModifierDefinition): TranslatedProperty {
        const context: ModifierContext = {
            untransformedData: data, 
            currentValue: value,
            parameter: null
        }
        
        Object.entries(requestedModifiers).forEach(([name, parameter]) => {
            if (!(name in Modifiers.MODIFIERS)) {
                return;
            }
            
            context.parameter = parameter;
            context.currentValue = Modifiers.MODIFIERS[name](context);
        })
        
        return context.currentValue;
    }

}