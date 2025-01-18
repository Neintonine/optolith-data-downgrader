import {ModifierContext} from "./Modifiers";

export function prefix(context: ModifierContext) {
    return context.parameter + context.currentValue.toString()
}