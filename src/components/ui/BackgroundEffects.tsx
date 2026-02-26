import { motion } from 'framer-motion';

export function BackgroundEffects() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {/* White base */}
            <div className="absolute inset-0 bg-white" />

            {/* Subtle pastel blobs */}
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full opacity-[0.15] filter blur-[140px]"
                style={{ background: 'linear-gradient(135deg, #c7d2fe, #e0e7ff)' }}
                animate={{ x: [0, 40, 0], y: [0, 60, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute top-[20%] -right-[10%] w-[40%] h-[55%] rounded-full opacity-[0.12] filter blur-[130px]"
                style={{ background: 'linear-gradient(135deg, #ddd6fe, #ede9fe)' }}
                animate={{ x: [0, -50, 0], y: [0, -30, 0], scale: [1, 0.9, 1] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
            <motion.div
                className="absolute -bottom-[15%] left-[20%] w-[55%] h-[40%] rounded-full opacity-[0.10] filter blur-[120px]"
                style={{ background: 'linear-gradient(135deg, #fbcfe8, #c7d2fe)' }}
                animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            />
        </div>
    );
}
