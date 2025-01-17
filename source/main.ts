import {Command} from "commander";
import Converter from "./Converter/Converter";
import TranslationContainer from "./Translations/TranslationContainer";
import path from "node:path";
import {Transformers} from "./Transformer/Transformers";
import {Modifiers} from "./Transformer/Modifiers/Modifiers";
import {SaveContext, Saver} from "./Saver";

const FIXED_FOLDERNAMES = [
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
    .option('--translation-path', 'Defines the folder, where the translation from source to destination can be found', './data/translations')

program
    .command('convert [entries...]')
    .option('-s, --source-path <PATH>', 'Defines what folder should be used as base for the database', './data/source')
    .option('-d, --destination-path <PATH>', 'Defines what folder should be used as target for the new database', './data/target')
    .option('-c, --clean-destination', "When set, the destination folder will get completely wiped, if it already exists.", false)
    .option('-o, --override-existing-files', 'When set, the destination files will get replaced by the new version. If --clean-destination is enabled, this option does nothing', false)
    .description("Converts the database from <source> to the new database at <destination>")
    .action(async (entries: string[], options) => {
        const {
            translationPath,
        } = program.opts()
        
        const {
            sourcePath,
            destinationPath,
            cleanDestination,
            overrideExistingFiles
        } = options
        
        const translationContainer = new TranslationContainer(translationPath)
        const converter = new Converter(new Transformers(), new Modifiers())
        const saver = new Saver(path.resolve(destinationPath), overrideExistingFiles);
        
        const tablePromises: Promise<SaveContext>[] = entries.map(async (type): Promise<SaveContext> => {
            let translation;
            try {
                translation = translationContainer.loadTranslation(type);
            } catch (e: any) {
                console.error(e.message);
                throw e;
            }
            
            const dbPath = path.resolve(sourcePath, type);
            const table = await converter.convert(
                translation,
                dbPath
            );
            
            return {
                table,
                targetName: translation.targetName
            }
        })
        
        const saveContexts = await Promise.all(tablePromises);
        
        await saver.ensureAvailability(FIXED_FOLDERNAMES, cleanDestination);
        await saver.save(saveContexts);
    })

program.parseAsync();