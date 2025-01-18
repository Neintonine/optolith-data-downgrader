import {CachingDictionary} from "./CachingDictionary";
import fs, {glob} from "node:fs";
import path from "node:path";
import * as yaml from "js-yaml";

export class DataLoader {
    constructor(
        private readonly sourcePath: string,
        private readonly cache: CachingDictionary<string, unknown>
    ) {
    }
    
    public async getDatasetById<T>(folder: string, id: number): Promise<T> {
        const cacheKey = folder + "_" + id.toString()
        return await this.cache.rememberAsync(cacheKey, async () => {
            const directory = path.resolve(this.sourcePath, folder);

            const result = await new Promise<string[]>((resolve, reject) => {
                glob(
                    `${directory}/${id.toString()}_*.yml`,
                    (err, matches) => {
                        if (err) reject(err);
                        resolve(matches)
                    }
                )
            })

            if (result.length < 1) {
                return undefined;
            }

            const foundPath = result[0];

            const file: string = await new Promise((resolve, reject) => {
                fs.readFile(foundPath, 'utf-8', (err, data) => {
                    if (err) reject(err);

                    resolve(data)
                })
            })

            const data: unknown = yaml.load(file)
            return data;
        });
    }
}