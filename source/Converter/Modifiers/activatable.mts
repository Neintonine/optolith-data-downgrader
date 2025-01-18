import {ModifierContext} from "./Modifiers";
import {
    AdventurePointsValue,
    ExplicitCombatTechniqueSelectOption,
    ExplicitGeneralSelectOption,
    ExplicitSkillSelectOption,
    SelectOptions
} from "optolith-database-schema/types/_Activatable";
import {PublicationRefs, SimpleOccurrence, Since} from "optolith-database-schema/types/source/_PublicationRef";
import {Publication} from "optolith-database-schema/types/source/Publication";
import {GeneralPrerequisites} from "optolith-database-schema/types/_Prerequisite";
import {GeneralPrerequisiteGroup} from "optolith-database-schema/types/prerequisites/PrerequisiteGroups";

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
        
        if ('revisions' in occurrences) {
            // @ts-expect-error
            return (<Since> occurrences.revisions?.findLast((revision) => revision.tag === "Since")?.since).pages.map((page) => {
                return {
                    id,
                    firstPage: page.first_page,
                    lastPage: page.last_page
                }
            })
        }
        
        const occurrence = <SimpleOccurrence>occurrences;
        return {
            id,
            firstPage: occurrence.first_page,
            lastPage: occurrence.last_page
        }
    })
    
    const occurrences = await Promise.all(promises);
    return occurrences.filter((value) => value).flat();
}

function convertPrerequisites(prerequisites: GeneralPrerequisites, forUniversal: boolean) {
    prerequisites.map((prerequisite) => {
        switch (prerequisite.prerequisite.tag) {
            case "Single":
                return convertPrerequisite(prerequisite.prerequisite.single)
            case "Disjunction":
                break;
            case "Group":
                break;
        }
    })
}

function convertPrerequisite(prerequisite: GeneralPrerequisiteGroup) {
    switch (prerequisite.tag) {
        case "Sex":
            return {
                sexPrerequisite: prerequisite.sex.id === 'Male' ? 'm' : 'f'
            }
        case "Race":
            return {
                racePrerequisite: {
                    race: "R_" + prerequisite.race.id,
                    active: prerequisite.race.active
                }
            }
        case "Culture":
            return {
                culturePrerequisite: 'C_' + prerequisite.culture.id
            }
        case "Pact":
            return {
                pactPrerequisite: {
                    category: prerequisite.pact.category.id.pact_category,
                    domain: prerequisite.pact.domain_id,
                    level: prerequisite.pact.level
                }
            }
        case "SocialStatus":
            return {
                socialStatusPrerequisite: prerequisite.social_status.id.social_status
            }
        case "PrimaryAttribute":
            return {
                primaryAttributePrerequisite: {
                    type: prerequisite.primary_attribute.category.toLowerCase(),
                    value: prerequisite.primary_attribute.value
                }
            }
        case "Activatable":
            return {
                activatablePrerequisites: prerequisite.activatable.id.tag
            }
            break;
        case "Rated":
            break;
    }
}

export function convertSelectOptions(context: ModifierContext) {
    if (!context.currentValue) {
        return undefined;
    }
    
    const value = <SelectOptions>context.currentValue
    
    if (value.explicit) {
        return value.explicit.map((option) => {
            let prerequisite: ExplicitGeneralSelectOption|ExplicitSkillSelectOption|ExplicitCombatTechniqueSelectOption|null = null;
            switch (option.tag) {
                case "General":
                    prerequisite = option.general
                    break;
                case "Skill":
                    break;
                case "CombatTechnique":
                    break;
            }
            
            if (prerequisite === null) {
                throw new Error(`Unknown prerequsite type: ${option.tag}`);
            }
            
            if (context.language === 'universal') {
                return {
                    id: prerequisite.id,
                    cost: prerequisite.ap_value,
                    
                }
            }
        })
    }
}