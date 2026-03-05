import React from 'react';

const LoadingSpinner = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="loader"></div>
            <style jsx>{`
            .loader {
                border: 16px solid #f3f3f3; /* Light grey */
                border-top: 16px solid #3498db; /* Blue */
                border-radius: 50%;
                width: 60px;
                height: 60px;
                animation: spin 2s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;

// Existing redirect logic here
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Page = () => {
    const router = useRouter();
    const shouldRedirect = true; // placeholder, replace with actual condition

    useEffect(() => {
        if (shouldRedirect) {
            // redirect logic
            router.push('/redirect-url');
        }
    }, [shouldRedirect]);

    return shouldRedirect ? <LoadingSpinner /> : <div>Your Page Content</div>;
};

export default Page;