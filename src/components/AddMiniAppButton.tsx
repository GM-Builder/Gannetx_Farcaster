import { useAddFrame } from '@coinbase/onchainkit/minikit';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaPlus, FaSpinner } from 'react-icons/fa';

export function AddMiniAppButton() {
    const [isSaving, setIsSaving] = useState(false);
    const addFrame = useAddFrame();

    const handleAddMiniApp = async () => {
        setIsSaving(true);
        try {
            const result = await addFrame();

            if (result?.token) {
                // Save notification token to backend for push notifications
                try {
                    await fetch('/api/save-notification-token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: result.token }),
                    });
                    console.log('✅ Notification token saved');
                } catch (tokenErr) {
                    console.warn('⚠️ Failed to save notification token:', tokenErr);
                }
            }

            toast.success('Mini App saved to your collection!');
        } catch (error) {
            console.error('Failed to add frame:', error);
            toast.error('Failed to save Mini App');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <button
            onClick={handleAddMiniApp}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            title="Save this Mini App to your collection"
        >
            {isSaving ? (
                <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Saving...</span>
                </>
            ) : (
                <>
                    <FaPlus size={14} />
                    <span>Save Mini App</span>
                </>
            )}
        </button>
    );
}
