import {ModifierDefinition} from "../Converter/Modifiers/Modifiers";

interface PropertyOptions {
    universal: boolean|"both";
    modifier: ModifierDefinition;
}

interface LoadedProperty extends Nullable<PropertyOptions> {
    property: [string, string]|string;
}
interface Property extends PropertyOptions {
    propertyFrom: string;
    propertyTo: string;
}