// config/video-platforms.ts
export const VIDEO_PLATFORM_CONFIGS = {
    instagram: {
        aspect_ratios: ['9:16', '1:1', '16:9'],
        optimal_duration: '15-30 seconds',
        max_duration: '90 seconds',
        video_trends: ['transitions', 'before-after', 'tutorials', 'behind-scenes'],
        engagement_factors: ['hook within 3 seconds', 'clear audio', 'captions', 'trending music'],
        technical_specs: ['1080x1920 for reels', 'MP4 format', 'H.264 codec', 'max 100MB'],
        camera_recommendations: ['dynamic movements', 'close-ups', 'smooth transitions', 'vertical optimization']
    },
    youtube_shorts: {
        aspect_ratios: ['9:16'],
        optimal_duration: '15-60 seconds',
        max_duration: '60 seconds',
        video_trends: ['educational', 'entertaining', 'trending topics', 'quick tutorials'],
        engagement_factors: ['strong opening', 'clear value proposition', 'call-to-action', 'searchable titles'],
        technical_specs: ['1080x1920', 'MP4', 'H.264', 'max 256MB'],
        camera_recommendations: ['clear subject focus', 'good lighting', 'minimal camera shake', 'engaging angles']
    },
    youtube_thumbnail: {
        aspect_ratios: ['16:9'],
        optimal_duration: '10-30 seconds',
        max_duration: '60 seconds',
        video_trends: ['eye-catching visuals', 'preview content', 'clickbait elements', 'channel branding'],
        engagement_factors: ['compelling thumbnail design', 'strong visual hook', 'clear subject', 'brand consistency'],
        technical_specs: ['1920x1080', 'MP4', 'H.264', 'max 512MB'],
        camera_recommendations: ['high-quality shots', 'clear main subject', 'good lighting', 'attractive composition']
    },
    tiktok: {
        aspect_ratios: ['9:16'],
        optimal_duration: '15-30 seconds',
        max_duration: '10 minutes',
        video_trends: ['challenges', 'duets', 'effects', 'trending sounds', 'quick cuts'],
        engagement_factors: ['immediate hook', 'trending audio', 'hashtag optimization', 'authentic content'],
        technical_specs: ['1080x1920', 'MP4', 'H.264', 'max 287MB'],
        camera_recommendations: ['face-focused', 'good lighting', 'smooth movements', 'creative angles']
    },
    twitter: {
        aspect_ratios: ['16:9', '1:1', '9:16'],
        optimal_duration: '30-45 seconds',
        max_duration: '2 minutes 20 seconds',
        video_trends: ['news clips', 'reactions', 'explainers', 'memes'],
        engagement_factors: ['clear message', 'subtitles', 'engaging thumbnail', 'conversation starter'],
        technical_specs: ['1280x720 minimum', 'MP4', 'max 512MB'],
        camera_recommendations: ['stable shots', 'clear subjects', 'good contrast', 'readable text']
    },
    linkedin: {
        aspect_ratios: ['16:9', '1:1', '9:16'],
        optimal_duration: '30-60 seconds',
        max_duration: '10 minutes',
        video_trends: ['professional insights', 'industry news', 'thought leadership', 'case studies'],
        engagement_factors: ['professional tone', 'valuable content', 'clear messaging', 'industry relevance'],
        technical_specs: ['1920x1080 preferred', 'MP4', 'max 5GB'],
        camera_recommendations: ['professional quality', 'good audio', 'stable footage', 'clear presentation']
    }
} as const;