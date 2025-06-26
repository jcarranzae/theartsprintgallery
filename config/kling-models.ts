// config/kling-models.ts
export const KLING_MODELS = {
    'kling-1-0': {
        name: 'Kling 1.0',
        description: 'Original model for basic text-to-video generation',
        optimal_prompt_style: 'clear and straightforward',
        max_tokens: 400,
        max_duration: '5 seconds',
        resolution: '1080p@30fps',
        strengths: ['basic motion', 'simple camera movements', 'fast processing'],
        prompt_guidelines: [
            'Use simple action verbs for clear motion',
            'Specify basic camera movements (pan, tilt, zoom)',
            'Keep prompts under 400 characters',
            'Focus on single primary action',
            'Describe lighting and atmosphere briefly'
        ]
    },
    'kling-1-5': {
        name: 'Kling 1.5',
        description: 'Enhanced model with Motion Brush and Face Model features',
        optimal_prompt_style: 'detailed with motion specifics',
        max_tokens: 600,
        max_duration: '5-10 seconds',
        resolution: '1080p@30fps',
        strengths: ['motion brush control', 'face consistency', 'camera movements', 'professional mode'],
        prompt_guidelines: [
            'Include specific motion direction and intensity',
            'Describe character facial expressions and consistency',
            'Use cinematic camera language',
            'Specify motion blur and speed effects',
            'Add environmental motion details'
        ]
    },
    'kling-1-6': {
        name: 'Kling 1.6',
        description: 'Advanced model with Elements feature and 195% improved image-to-video',
        optimal_prompt_style: 'comprehensive with sequential actions',
        max_tokens: 800,
        max_duration: '10 seconds',
        resolution: '1080p@30fps',
        strengths: ['elements integration', 'complex sequences', 'multiple objects', 'enhanced adherence'],
        prompt_guidelines: [
            'Structure complex sequential actions clearly',
            'Use Elements feature for character consistency',
            'Describe object interactions and physics',
            'Include temporal progression markers',
            'Specify detailed environmental changes'
        ]
    },
    'kling-2-0': {
        name: 'Kling 2.0',
        description: 'Major architecture upgrade with extended duration and Multi-Elements Editor',
        optimal_prompt_style: 'narrative-focused with cinematic quality',
        max_tokens: 1200,
        max_duration: '2-3 minutes',
        resolution: '1080p@30fps',
        strengths: ['long-form content', 'multi-elements editor', 'cinematic quality', 'character consistency'],
        prompt_guidelines: [
            'Structure narrative arcs with clear progression',
            'Use advanced cinematic techniques and terminology',
            'Include detailed character development and consistency',
            'Specify scene transitions and pacing',
            'Describe complex environmental storytelling'
        ]
    },
    'kling-2-1': {
        name: 'Kling 2.1',
        description: 'Latest tiered system with Standard/Pro/Master quality levels',
        optimal_prompt_style: 'precision-engineered for tier-specific output',
        max_tokens: 1000,
        max_duration: '3 minutes',
        resolution: '1080p@30fps',
        strengths: ['tiered quality', 'fast rendering', 'cost optimization', 'enhanced details'],
        prompt_guidelines: [
            'Optimize prompts for specific quality tiers',
            'Use professional terminology for Master tier',
            'Include technical specifications for Pro tier',
            'Keep concise but effective for Standard tier',
            'Leverage cost-effectiveness for iteration'
        ]
    }
} as const;