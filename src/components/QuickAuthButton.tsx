import { useAuthenticate } from '@coinbase/onchainkit/minikit';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaLock, FaSpinner } from 'react-icons/fa';

export function QuickAuthButton() {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const { signIn } = useAuthenticate();

    const handleAuth = async () => {
        setIsAuthenticating(true);
        try {
            const result = await signIn();

            if (result) {
                // SignInResult contains user data
                console.log('✅ Auth successful:', result);

                // Store the entire result for future use
                localStorage.setItem('auth_result', JSON.stringify(result));

                toast.success('Authenticated successfully!');
            }
        } catch (error) {
            console.error('Authentication failed:', error);
            toast.error('Authentication failed');
        } finally {
            setIsAuthenticating(false);
        }
    };

    return (
        <button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            title="Authenticate with Farcaster"
        >
            {isAuthenticating ? (
                <>
                    <FaSpinner className="animate-spin" size={14} />
                    <span>Authenticating...</span>
                </>
            ) : (
                <>
                    <FaLock size={14} />
                    <span>Quick Auth</span>
                </>
            )}
        </button>
    );
}
