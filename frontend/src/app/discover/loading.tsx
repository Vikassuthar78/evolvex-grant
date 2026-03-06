import AppLayout from '@/components/layout/AppLayout';
import LoadingState from '@/components/ui/LoadingState';

export default function Loading() {
    return (
        <AppLayout>
            <LoadingState message="Discovering grants..." />
        </AppLayout>
    );
}
