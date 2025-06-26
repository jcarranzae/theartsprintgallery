// config/platforms.ts (actualizado para video)
export const PLATFORM_CONFIGS = {
  instagram: {
    aspect_ratio: '1:1, 4:5, 9:16',
    style_trends: ['minimalist', 'lifestyle', 'aesthetic', 'colorful'],
    engagement_factors: ['visual appeal', 'brand consistency', 'trending hashtags', 'story-worthy'],
    optimal_colors: ['warm tones', 'pastel colors', 'high contrast', 'brand colors'],
    technical_specs: ['high resolution', 'square format preferred', 'mobile optimized'],
    video_specs: {
      max_duration: '90 seconds',
      optimal_duration: '15-30 seconds',
      aspect_ratios: ['9:16', '1:1', '16:9'],
      features: ['reels', 'stories', 'igtv', 'posts']
    }
  },
  youtube_shorts: {
    aspect_ratio: '9:16',
    style_trends: ['educational', 'entertaining', 'trending', 'hook-focused'],
    engagement_factors: ['strong opening', 'clear value', 'call-to-action', 'thumbnail appeal'],
    optimal_colors: ['bright colors', 'high contrast', 'eye-catching'],
    technical_specs: ['vertical video', '1080x1920', 'mobile-first'],
    video_specs: {
      max_duration: '60 seconds',
      optimal_duration: '15-60 seconds',
      aspect_ratios: ['9:16'],
      features: ['shorts', 'vertical', 'mobile-optimized']
    }
  },
  youtube_thumbnail: {
    aspect_ratio: '16:9',
    style_trends: ['clickbait', 'bold design', 'eye-catching', 'clear subject'],
    engagement_factors: ['visual appeal', 'curiosity gap', 'clear subject', 'brand recognition'],
    optimal_colors: ['bright colors', 'high contrast', 'YouTube red', 'complementary colors'],
    technical_specs: ['1280x720 minimum', 'under 2MB', 'JPG/PNG format', 'safe areas'],
    video_specs: {
      max_duration: 'N/A',
      optimal_duration: 'N/A',
      aspect_ratios: ['16:9'],
      features: ['static image', 'thumbnail', 'clickable']
    }
  },
  tiktok: {
    aspect_ratio: '9:16',
    style_trends: ['authentic', 'creative', 'trending', 'viral'],
    engagement_factors: ['immediate hook', 'trending audio', 'authentic feel', 'shareability'],
    optimal_colors: ['vibrant colors', 'high saturation', 'trendy palettes'],
    technical_specs: ['vertical video', 'mobile-first', 'short attention span'],
    video_specs: {
      max_duration: '10 minutes',
      optimal_duration: '15-30 seconds',
      aspect_ratios: ['9:16'],
      features: ['effects', 'filters', 'music', 'duets']
    }
  },
  twitter: {
    aspect_ratio: '16:9, 1:1',
    style_trends: ['newsworthy', 'reaction', 'informative', 'viral'],
    engagement_factors: ['clear message', 'controversy', 'timeliness', 'shareability'],
    optimal_colors: ['brand colors', 'high contrast', 'readable'],
    technical_specs: ['optimized for timeline', 'text-readable', 'quick consumption'],
    video_specs: {
      max_duration: '2 minutes 20 seconds',
      optimal_duration: '30-45 seconds',
      aspect_ratios: ['16:9', '1:1', '9:16'],
      features: ['autoplay', 'muted by default', 'subtitles recommended']
    }
  },
  linkedin: {
    aspect_ratio: '16:9, 1:1',
    style_trends: ['professional', 'educational', 'industry-focused', 'thought leadership'],
    engagement_factors: ['professional value', 'industry relevance', 'expertise showcase'],
    optimal_colors: ['professional palette', 'corporate colors', 'sophisticated'],
    technical_specs: ['business appropriate', 'high quality', 'professional presentation'],
    video_specs: {
      max_duration: '10 minutes',
      optimal_duration: '30-60 seconds',
      aspect_ratios: ['16:9', '1:1', '9:16'],
      features: ['native video', 'professional content', 'business-focused']
    }
  }
} as const;