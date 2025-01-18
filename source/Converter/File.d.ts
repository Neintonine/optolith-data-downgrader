type OriginalFile = Dictionary<unknown>
type Entry = Map<string, TranslatedProperty>

type Table = Entry[]

type TranslatedProperty = Dictionary<unknown>

type FormattedEntry = Dictionary<unknown>
type FormattedTable = FormattedEntry[]
type FormattedFile = {
    universal: FormattedTable,
    translations: Map<string, FormattedTable>
}