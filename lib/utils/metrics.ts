// lib/utils/metrics.ts
export class MetricsCollector {
    private static instance: MetricsCollector;
    private metrics: Map<string, any[]> = new Map();

    static getInstance(): MetricsCollector {
        if (!MetricsCollector.instance) {
            MetricsCollector.instance = new MetricsCollector();
        }
        return MetricsCollector.instance;
    }

    recordGeneration(data: {
        contentType: string;
        platform: string;
        model: string;
        processingTime: number;
        confidence: number;
        promptLength: number;
        agentsUsed: string[];
    }): void {
        const key = `${data.contentType}_${data.platform}_${data.model}`;

        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }

        this.metrics.get(key)!.push({
            timestamp: new Date().toISOString(),
            ...data
        });
    }

    getAverageProcessingTime(contentType: string, platform: string, model: string): number {
        const key = `${contentType}_${platform}_${model}`;
        const data = this.metrics.get(key) || [];

        if (data.length === 0) return 0;

        const totalTime = data.reduce((sum, item) => sum + item.processingTime, 0);
        return totalTime / data.length;
    }

    getAverageConfidence(contentType: string, platform: string, model: string): number {
        const key = `${contentType}_${platform}_${model}`;
        const data = this.metrics.get(key) || [];

        if (data.length === 0) return 0;

        const totalConfidence = data.reduce((sum, item) => sum + item.confidence, 0);
        return totalConfidence / data.length;
    }

    getMetricsSummary(): any {
        const summary: any = {};

        for (const [key, data] of this.metrics.entries()) {
            const [contentType, platform, model] = key.split('_');

            summary[key] = {
                contentType,
                platform,
                model,
                totalGenerations: data.length,
                averageProcessingTime: this.getAverageProcessingTime(contentType, platform, model),
                averageConfidence: this.getAverageConfidence(contentType, platform, model),
                lastGeneration: data[data.length - 1]?.timestamp
            };
        }

        return summary;
    }
}