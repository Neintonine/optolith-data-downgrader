import {Dir} from "node:fs";
import * as fs from "node:fs";
import path from "node:path";
import * as yaml from 'js-yaml';
import {
    Entry,
    Table,
    OriginalFile
} from "./File";
import {Transformer} from "./Transformer";
import {Modifiers} from "./Modifiers/Modifiers";

export type ConverterContext = {
    data: OriginalFile,
    translation: Translation,
    modifiers: Modifiers
}

export default class Converter {
    constructor(
        private readonly transformer: Transformer,
        private readonly modifiers: Modifiers
    ) {}
    
    public async convert(translation: Translation, directoryPath: string): Promise<Table> {
        const directory = await new Promise<Dir>((resolve, reject) => {
            fs.opendir(directoryPath, (err, dir) => {
                if (err) {
                    reject(err)
                    return;
                }
                
                resolve(dir);
            })
        })
        
        const promises: Promise<Entry>[] = [];
        
        let entry: fs.Dirent | null;
        // eslint-disable-next-line no-cond-assign
        while (entry = await directory.read()) {
            if (!entry.isFile()) {
                continue;
            }
            
            if (path.extname(entry.name) !== '.yml') {
                continue;
            }
            
            const filePath = path.join(entry.parentPath, entry.name);
            promises.push(this.convertFile(translation, filePath));
        }
        
        const values = await Promise.all(promises)
        
        await directory.close();
        
        return values;
    }
    
    public async convertFile(translation: Translation, filepath: string): Promise<Entry> {
        const file: string = await new Promise((resolve, reject) => {
            fs.readFile(filepath, 'utf-8', (err, data) => {
                if (err) reject(err);
                
                resolve(data)
            })
        })
        
        const data: OriginalFile = yaml.load(file)
        
        const context: ConverterContext = {
            translation,
            data,
            modifiers: this.modifiers
        }
        
        return this.transformer.convertEntry(context);
    }


}