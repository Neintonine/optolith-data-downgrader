import {ModifierContext} from "./Modifiers";

type GetValueParameter = {
    path: string,
    startRaw?: boolean
}

export function getValue(context: ModifierContext) {
    const parameter = <GetValueParameter>context.parameter;
    const steps = parameter.path.split('.');

    let value = parameter.startRaw ? context.untransformedData : context.currentValue;
    for (const step of steps) {
        if (value === undefined) {
            return undefined;
        }
        
        if (!(step in value)) {
            return undefined
        }
        
        value = value[step]
    }
    
    return value;
}

export function getTranslatedValue(context: ModifierContext) {
    const value = getValue(context);
    
    if (value === undefined) {
        return undefined
    }
    
    if (!(context.language in value)) {
        return undefined;
    }
    
    return value[context.language];
}