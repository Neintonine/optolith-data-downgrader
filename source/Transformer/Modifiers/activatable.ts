import {ModifierContext} from "./Modifiers";
import {AdventurePointsValue} from "optolith-database-schema/types/_Activatable";
import {
    PublicationRefs,
    SimpleOccurrence,
    VersionedOccurrence
} from "optolith-database-schema/types/source/_PublicationRef";
import {Publication} from "optolith-database-schema/types/source/Publication";

type GenericPrerequisiteList = {
    tag: string
}[]

export function calculateCost(context: ModifierContext) {
    const value = <AdventurePointsValue>context.currentValue
    switch (value.tag) {
        case "Fixed":
            return value.fixed
        case "ByLevel":
            return value.by_level
        case "Indefinite":
            return 0;
        case "DerivedFromSelection":
            return 0;
    }
}

export function hasPrerequisiteTag(context: ModifierContext) {
    const value = <GenericPrerequisiteList>context.currentValue
    
    if (!value) {
        return undefined;
    }
    
    return value.some((prerequisite) => prerequisite.tag === context.parameter)
}

export async function convertSource(context: ModifierContext) {
    const value = <PublicationRefs>context.currentValue

    const promises = value.map(async (publicationRef) => {
        const publicationData = await context.dataLoader.getDatasetById<Publication>(
            "Publications",
            publicationRef.id.publication
        )
        
        if (!(context.language in publicationData.translations)) {
            return undefined;
        }
        
        const id = publicationData.translations[context.language].id;
        
        const occurrences = publicationRef.occurrences[context.language]
        
        if (Array.isArray(occurrences)) {
            return occurrences.map((occurrence) => {
                return {
                    id,
                    firstPage: occurrence.first_page,
                    lastPage: occurrence.last_page
                }
            })
        }
        
        if (occurrences.revisions) {
            return (<VersionedOccurrence>occurrences).revisions?.findLast((revision) => revision.tag === "Since")?.since.pages.map((page) => {
                return {
                    id,
                    firstPage: page.first_page,
                    lastPage: page.last_page
                }
            })
        }
        
        return {
            id,
            firstPage: occurrences.first_page,
            lastPage: occurrences.last_page
        }
    })
    
    const occurrences = await Promise.all(promises);
    const result = occurrences.filter((value) => value).flat();
    return result;
}