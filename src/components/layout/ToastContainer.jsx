import { useState, useEffect } from 'react';

export const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        const handleCustomToast = (e) => {
            const newToast = { id: Date.now(), msg: e.detail.msg, type: e.detail.type || 'info' };
            setToasts(prev => [...prev, newToast]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 3000);
        };

        window.addEventListener('showToast', handleCustomToast);
        return () => window.removeEventListener('showToast', handleCustomToast);
    }, []);

    return (
        <div id="toast-container" className="toast-container" aria-live="polite">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast toast-${toast.type} glass-card show`}>
                    {toast.msg}
                </div>
            ))}
        </div>
    );
};

