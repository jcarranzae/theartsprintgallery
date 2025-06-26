// config/video-prompt-patterns.ts
export const KLING_PROMPT_PATTERNS = {
    'kling-1-0': {
        structure: '[SUBJECT] [ACTION] [ENVIRONMENT], [BASIC_CAMERA], [LIGHTING]',
        example: 'A chef flipping a pancake in a bright kitchen, static shot, warm lighting'
    },
    'kling-1-5': {
        structure: '[SUBJECT] [DETAILED_ACTION] [ENVIRONMENT], [CAMERA_MOVEMENT], [MOTION_EFFECTS], [ATMOSPHERE]',
        example: 'A dancer spinning gracefully on a rooftop at sunset, camera rotating around subject, motion blur on dress, golden hour atmosphere'
    },
    'kling-1-6': {
        structure: '[CHARACTER] [SEQUENTIAL_ACTIONS] [DETAILED_ENVIRONMENT], [ADVANCED_CAMERA], [PHYSICS_DETAILS], [TEMPORAL_ELEMENTS]',
        example: 'A skateboarder approaches the ramp (2s), launches into air with board spinning (3s), lands smoothly (2s), urban skate park with graffiti walls, tracking shot following motion, realistic physics and gravity, slow motion during air time'
    },
    'kling-2-0': {
        structure: '[NARRATIVE_SETUP] → [CHARACTER_DEVELOPMENT] → [ENVIRONMENTAL_STORYTELLING] → [CINEMATIC_PROGRESSION] → [RESOLUTION]',
        example: 'A lone astronaut discovers an alien artifact on Mars → their expression shifts from curiosity to wonder → the red landscape reflects in their visor → camera pulls back revealing the vast Martian landscape → the artifact begins to glow, suggesting new possibilities'
    },
    'kling-2-1': {
        structure: '[TIER_OPTIMIZED_SUBJECT] [QUALITY_SPECIFIC_ACTION] [ENVIRONMENT], [TIER_APPROPRIATE_CAMERA], [TECHNICAL_SPECS]',
        example: 'Professional chef (Master tier detail) expertly julienning vegetables with precise knife work, modern kitchen with commercial equipment, macro lens capturing knife technique, 60fps for smooth motion capture'
    }
} as const;
