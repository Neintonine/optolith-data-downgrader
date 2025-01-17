
type OriginalFile = Dictionary<any>
type Entry = Map<string, TranslatedProperty>

type Table = Entry[]

type TranslatedProperty = Dictionary<any>

type FormattedEntry = Dictionary<any>
type FormattedTable = FormattedEntry[]
type FormattedFile = {
    universal: FormattedTable,
    translations: Map<string, FormattedTable>
}

export interface Transformer {
    getValue(data: OriginalFile, property: Property): TranslatedProperty;
}