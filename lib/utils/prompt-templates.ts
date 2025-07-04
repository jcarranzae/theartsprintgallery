// lib/utils/prompt-templates.ts
export const PROMPT_TEMPLATES = {
    image: {
        basic: "A [SUBJECT] [ACTION] in [ENVIRONMENT], [STYLE], [LIGHTING], [COMPOSITION]",
        detailed: "[DETAILED_SUBJECT] [SPECIFIC_ACTION] in [DETAILED_ENVIRONMENT], [ARTISTIC_STYLE], [LIGHTING_SETUP], [CAMERA_ANGLE], [MOOD], [TECHNICAL_SPECS]",
        creative: "[CREATIVE_CONCEPT] featuring [SUBJECT] [ARTISTIC_ACTION] in [IMAGINATIVE_ENVIRONMENT], [UNIQUE_STYLE], [DRAMATIC_LIGHTING], [INNOVATIVE_COMPOSITION]"
    },
    video: {
        basic: "A [SUBJECT] [ACTION] in [ENVIRONMENT], [CAMERA_MOVEMENT], [DURATION], [STYLE]",
        cinematic: "[CHARACTER] [SEQUENCE_OF_ACTIONS] in [DETAILED_ENVIRONMENT], [CAMERA_CHOREOGRAPHY], [TIMING], [VISUAL_STYLE], [MOTION_EFFECTS]",
        narrative: "[STORY_SETUP] → [CHARACTER] [PROGRESSION] in [EVOLVING_ENVIRONMENT] → [CAMERA_JOURNEY] → [VISUAL_CLIMAX] → [RESOLUTION], [CINEMATIC_STYLE], [TEMPORAL_STRUCTURE]"
    }
};