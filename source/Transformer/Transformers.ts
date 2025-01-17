import {Standard} from "./Implermentations/Standard";
import {UnknownTransformerError} from "./UnknownTransformerError";
import {Transformer} from "./Transformer";

export class Transformers {
    private static TRANSFORMER_CLASSES: Dictionary<any> = {
        "standard": Standard
    }
    
    public getInstanceForTransformer(transformerString: string): Transformer {
        if (transformerString !in Transformers.TRANSFORMER_CLASSES) {
            throw new UnknownTransformerError(`Unknown transformer: ${transformerString}`)
        }
        
        // @ts-ignore
        return Object.create(Transformers.TRANSFORMER_CLASSES[transformerString.toLowerCase()].prototype);
    }
}