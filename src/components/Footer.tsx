import { Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
    return (
        <footer className="relative z-10 border-t border-border-subtle bg-bg-secondary/70 backdrop-blur-sm">
            <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-10 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-sm">TP</div>
                            <span className="font-bold text-text-primary text-base">TooProductive</span>
                        </div>
                        <p className="text-text-muted text-sm leading-relaxed">
                            The all-in-one productivity platform for developers who build, ship, and grow.
                        </p>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-bold text-text-primary text-sm mb-4">Platform</h4>
                        <ul className="space-y-2.5 text-sm text-text-secondary">
                            <li><button className="hover:text-accent-blue transition-colors">Dashboard</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">News Feed</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">Task Manager</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">Kanban Board</button></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="font-bold text-text-primary text-sm mb-4">Resources</h4>
                        <ul className="space-y-2.5 text-sm text-text-secondary">
                            <li><button className="hover:text-accent-blue transition-colors">Documentation</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">API Reference</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">Changelog</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">Status</button></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-text-primary text-sm mb-4">Legal</h4>
                        <ul className="space-y-2.5 text-sm text-text-secondary">
                            <li><button className="hover:text-accent-blue transition-colors">Privacy Policy</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">Terms of Service</button></li>
                            <li><button className="hover:text-accent-blue transition-colors">Cookie Policy</button></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-10 pt-6 border-t border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-text-muted text-sm flex items-center gap-1.5">
                        Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for developers
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" className="text-text-muted hover:text-text-primary transition-colors"><Github className="w-4.5 h-4.5" /></a>
                        <a href="#" className="text-text-muted hover:text-text-primary transition-colors"><Twitter className="w-4.5 h-4.5" /></a>
                        <a href="#" className="text-text-muted hover:text-text-primary transition-colors"><Linkedin className="w-4.5 h-4.5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
