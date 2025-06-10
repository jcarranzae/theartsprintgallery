// app/(dashboard)/dashboard/kling/history/page.tsx
import KlingVideoHistory from '@/components/ui/Kling/KlingVideoHistory';

export default function KlingHistoryPage() {
    return (
        <div className="min-h-screen"
            style={{
                background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            }}
        >
            <div className="container mx-auto py-8 px-6">
                <KlingVideoHistory />
            </div>
        </div>
    );
}