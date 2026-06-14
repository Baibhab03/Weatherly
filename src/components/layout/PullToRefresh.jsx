import { useState, useEffect, useRef } from 'react';

export const PullToRefresh = ({ children, onRefresh }) => {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);
    const containerRef = useRef(null);
    const maxPull = 120;
    const threshold = 80;

    useEffect(() => {
        const handleTouchStart = (e) => {
            if (window.scrollY === 0) {
                startY.current = e.touches[0].clientY;
            }
        };

        const handleTouchMove = (e) => {
            if (window.scrollY === 0 && startY.current > 0 && !isRefreshing) {
                currentY.current = e.touches[0].clientY;
                const diff = currentY.current - startY.current;
                if (diff > 0) {
                    const distance = Math.min(diff * 0.4, maxPull);
                    setPullDistance(distance);
                }
            }
        };

        const handleTouchEnd = async () => {
            if (pullDistance > threshold && !isRefreshing) {
                setIsRefreshing(true);
                setPullDistance(threshold);
                if (onRefresh) {
                    await onRefresh();
                }
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 500);
            } else {
                setPullDistance(0);
            }
            startY.current = 0;
            currentY.current = 0;
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [pullDistance, isRefreshing, onRefresh]);

    return (
        <div ref={containerRef} style={{ transform: `translateY(${pullDistance}px)`, transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none' }}>
            <div className="ptr-container" style={{ opacity: pullDistance / threshold }}>
                <div className="ptr-spinner"></div>
            </div>
            {children}
        </div>
    );
};

