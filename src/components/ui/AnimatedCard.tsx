import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface AnimatedCardProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    tilt?: boolean;
}

export function AnimatedCard({ children, className, onClick, tilt = true }: AnimatedCardProps) {
    const cardContent = (
        <div className={cn(
            "glass-panel h-full w-full rounded-2xl p-6 relative overflow-hidden",
            className
        )}>
            {children}
        </div>
    );

    if (tilt) {
        return (
            <motion.div
                whileHover={{ rotateX: 1.5, rotateY: -1.5, scale: 1.015, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                whileTap={{ scale: 0.98 }}
                onClick={onClick}
                className={cn("w-full h-full perspective-1000", onClick && "cursor-pointer")}
            >
                {cardContent}
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -3, transition: { type: "spring", stiffness: 400, damping: 25 } }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn("w-full h-full", onClick && "cursor-pointer")}
        >
            {cardContent}
        </motion.div>
    );
}
