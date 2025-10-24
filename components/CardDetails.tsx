"use client";

const GoalIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);
const LevelIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 6h12l3-6H3zM3 18l3-6h12l3 6H3z" />
    </svg>
);
const VibeIcon = () => (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

type CardDetailsProps = {
    goal: string;
    level: string;
    vibe: string;
};

const formatText = (text: string) => text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

export default function CardDetails({ goal, level, vibe }: CardDetailsProps) {
    return (
        <div className="grid grid-cols-3 gap-4 border-t border-gray-700 pt-3 mt-3">
            <div className="flex items-center gap-2" title="Goal Type">
                <GoalIcon />
                <span className="text-sm text-gray-300">{formatText(goal)}</span>
            </div>
            <div className="flex items-center gap-2" title="Skill Level">
                <LevelIcon />
                <span className="text-sm text-gray-300">{formatText(level)}</span>
            </div>
            <div className="flex items-center gap-2" title="Vibe">
                <VibeIcon />
                <span className="text-sm text-gray-300">{formatText(vibe)}</span>
            </div>
        </div>
    );
}