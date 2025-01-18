import {Command} from "commander";
import Converter from "./Converter/Converter";
import TranslationContainer from "./Translations/TranslationContainer";
import path from "node:path";
import {Transformer} from "./Converter/Transformer";
import {Modifiers} from "./Converter/Modifiers/Modifiers";
import {SaveContext, Saver} from "./Saver";
import {DataLoader} from "./Data/DataLoader";
import {CachingDictionary} from "./Data/CachingDictionary";
import fs from "node:fs";

const FIXED_FOLDER_NAMES = [
    'univ',
    'de-DE',
    'en-US',
    'fr-FR',
    'it-IT',
    'nl-BE',
    'pt-BR'
];

const program = new Command()

program.version('1.0.0')

program
    .option('--translation-path <PATH>', 'Defines the folder, where the translation from source to destination can be found', './data/translations')
    .option('-s, --source-path <PATH>', 'Defines what folder should be used as base for the database', './data/source')
    .option('-d, --destination-path <PATH>', 'Defines what folder should be used as target for the new database', './data/target')

program
    .command('convert [entries...]')
    .option('-c, --clean-destination', "When set, the destination folder will get completely wiped, if it already exists.", false)
    .option('-o, --override-existing-files', 'When set, the destination files will get replaced by the new version. If --clean-destination is enabled, this option does nothing', false)
    .description("Converts the database from <source> to the new database at <destination>")
    .action(async (entries: string[], options) => {
        const {
            translationPath,
            sourcePath,
            destinationPath,
        } = program.opts()
        
        const {
            cleanDestination,
            overrideExistingFiles
        } = options
        
        const translationContainer = new TranslationContainer(translationPath)
        const dataLoader = new DataLoader(sourcePath, new CachingDictionary<string, any>(25))
        const converter = new Converter(new Transformer(), new Modifiers(dataLoader))
        const saver = new Saver(path.resolve(destinationPath), overrideExistingFiles);
        
        if (entries.length < 1) {
            entries = await translationContainer.getTranslationNames();
        }
        
        const tablePromises: Promise<SaveContext>[] = entries.map(async (type): Promise<SaveContext> => {
            let translation;
            try {
                translation = translationContainer.loadTranslation(type);
            } catch (e: {message: string}) {
                console.error(e.message);
                throw e;
            }
            
            const dbPath = path.resolve(sourcePath, type);
            const table = await converter.convert(
                translation,
                dbPath
            );
            
            console.log(`Translation of ${type} completed...`)
            
            return {
                table,
                targetName: translation.targetName
            }
        })
        
        const saveContexts = await Promise.all(tablePromises);
        
        console.log("Saving...");
        
        await saver.ensureAvailability(FIXED_FOLDER_NAMES, cleanDestination);
        await saver.save(saveContexts);
    })

program.command('list')
    .description("Displays available translations")
    .action(async () => {
        const {
            translationPath,
            sourcePath
        } = program.opts()
        
        const translationContainer = new TranslationContainer(translationPath)
        const translationIndex = await translationContainer.getTranslationNames()
        
        console.log("The following translations are available:")
        for (const translationName of translationIndex) {
            const notice = !fs.existsSync(path.resolve(sourcePath, translationName)) ?
                " (missing database)" :
                ""
            
            console.log("- ", translationName, notice)
        }
    })

program.parseAsync();