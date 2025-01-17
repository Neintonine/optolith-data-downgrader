import {ModifierDefinition} from "../Transformer/Modifiers/Modifiers";

interface PropertyOptions {
    universal: boolean;
    modifier: ModifierDefinition;
}

interface LoadedProperty extends Nullable<PropertyOptions> {
    property: [string, string]|string;
}
interface Property extends PropertyOptions {
    propertyFrom: string;
    propertyTo: string;
}