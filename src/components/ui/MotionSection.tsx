import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MotionSectionProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function MotionSection({ children, delay = 0, className = '' }: MotionSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
