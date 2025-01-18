import {Entry, FormattedEntry, FormattedFile, FormattedTable, Table} from "./Transformer/Transformer";
import * as fs from "node:fs";
import path from "node:path";
import {context} from "esbuild";
import jsyaml from "js-yaml";

export type SaveContext = {
    table: Table, 
    targetName: string
}

export class Saver {
    constructor(
        private readonly destination: string,
        private readonly overrideFiles: boolean,
    ) {
    }
    
    public async ensureAvailability(foldernames: string[], force: boolean) {
        if (!fs.existsSync(this.destination)) {
            await this.createFolders(foldernames);
            return;
        }
        
        console.warn("Destination folder already exists...")
        if (!force) {
            console.warn("\t... no additional folder has been created.")
            
            return;
        }
        
        console.warn("\t... force-flag has been enabled. Trying to remove destination to start new.")
        
        await new Promise<void>((resolve, reject) => {
            fs.rm(this.destination, {
                recursive: true,
                force: true
            }, (err) => {
                if (err) reject(err);
                resolve()
            })
        })
        
        await this.createFolders(foldernames);
    }
    
    private async createFolders(foldernames: string[]): Promise<void> {
        const promises = foldernames.map((name) => {
            return new Promise<void>((resolve, reject) => {
                fs.mkdir(path.resolve(this.destination, name), {recursive: true}, (err, path) => {
                    if (err) reject(err);
                    resolve()
                })
            })
        })
        
        await Promise.all(promises)
    }
    
    public async save(contexts: SaveContext[]) {
        const promises: Promise<void>[] = [];
        for (const context of contexts) {
            const formatted = this.formatToFile(context.table);
            
            if (formatted.universal.length > 0) {
                const destination = path.resolve(this.destination, 'univ', context.targetName + '.yaml');
                promises.push(this.saveTable(destination, formatted.universal))
            }
            
            formatted.translations.forEach((table, languageKey) => {
                const destination = path.resolve(this.destination, languageKey, context.targetName + '.yaml');
                promises.push(this.saveTable(destination, table))
            })
        }

        return Promise.all(promises);
    }
    
    private async saveTable(targetPath: string, table: FormattedTable): Promise<void> {
        if (fs.existsSync(targetPath) && !this.overrideFiles) {
            console.warn(`Couldn't save to "${targetPath}": File already exists`);
            return;
        }
        
        const data = jsyaml.dump(table);
        return new Promise<void>((resolve, reject) => {
            fs.writeFile(
                targetPath,
                data,
                (err) => {
                    if (err) reject(err)
                    resolve()
                }
            )
        })
    }
    
    private formatToFile(entries: Table): FormattedFile {
        const result: FormattedFile = {
            universal: [],
            translations: new Map<string, FormattedTable>()
        }

        entries.forEach((entry) => {
            const universal: FormattedEntry = {};

            const usedLanguages: string[] = [];
            const languages: Dictionary<FormattedEntry> = {};

            entry.forEach((translations, propertyKey) => {
                Object.entries(translations).forEach(([langaugeKey, propertyValue]) => {
                    if (langaugeKey === 'universal') {
                        universal[propertyKey] = propertyValue;
                        return;
                    }

                    if (!(langaugeKey in languages)) {
                        languages[langaugeKey] = {};
                        usedLanguages.push(langaugeKey);
                    }
                    languages[langaugeKey][propertyKey] = propertyValue;
                })
            })

            if (Object.entries(universal).length > 0) {
                result.universal.push(universal);
            }

            usedLanguages.forEach((languageKey) => {
                if (!result.translations.has(languageKey)) {
                    result.translations.set(languageKey, [languages[languageKey]])
                    return;
                }

                result.translations.get(languageKey)?.push(languages[languageKey])
            })
        })

        return result
    }
}