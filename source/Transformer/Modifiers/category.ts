import {ModifierContext} from "./Modifiers";

export function isCategory(context: ModifierContext) {
    if (!('category' in context.untransformedData)) {
        return false;
    }

    return context.untransformedData['category'] === context.parameter;
}