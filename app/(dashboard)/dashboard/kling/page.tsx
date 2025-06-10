// app/(dashboard)/dashboard/kling/page.tsx
import KlingVideoGenerator from '@/components/ui/Kling/KlingVideoGenerator';

export default function KlingPage() {
    return (
        <div className="min-h-screen"
            style={{
                background: "linear-gradient(140deg, #1C228C 0%, #2C2A59 60%, #060826 100%)",
            }}
        >
            <div className="container mx-auto py-8">
                <KlingVideoGenerator />
            </div>
        </div>
    );
}