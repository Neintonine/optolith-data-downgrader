import {Dir} from "node:fs";
import * as fs from "node:fs";
import path from "node:path";
import * as yaml from 'js-yaml';
import {FormattedFile, Entry, TranslatedProperty, FormattedEntry, Table} from "../Transformer/Transformer";
import {Transformers} from "../Transformer/Transformers";
import {Modifiers} from "../Transformer/Modifiers/Modifiers";
import {stringify} from "node:querystring";

export default class Converter {
    constructor(
        private readonly transformers: Transformers,
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
        
        const data: any = yaml.load(file)
        const transformer = this.transformers.getInstanceForTransformer(translation.transformer);
        
        const newData: Entry = new Map<string, TranslatedProperty>();
        translation.properties.forEach((property) => {
            const newPropertyValue = transformer.getValue(data, property);
            
            Object.entries(newPropertyValue).forEach(([key, value]) => {
                newPropertyValue[key] = this.modifiers.apply(data, value, property.modifier)
                
            })
            newData.set(property.propertyTo, newPropertyValue);
        })
        
        return newData;
    }


}