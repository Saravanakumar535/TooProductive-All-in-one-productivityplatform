import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GradientButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'glass';
}

export function GradientButton({ children, className, variant = 'primary', ...props }: GradientButtonProps) {
    const base = "relative z-10 font-semibold px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 outline-none text-sm";

    const styles = {
        primary: "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
        glass: "bg-white/70 backdrop-blur-md border border-gray-200 text-gray-700 hover:bg-white shadow-sm",
    };

    return (
        <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className={cn("outline-none", className)}
            {...props}
        >
            <div className={cn(base, styles[variant])}>
                {children}
            </div>
        </motion.button>
    );
}
