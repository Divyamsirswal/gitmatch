"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

type FilterControlsProps = {
    currentFilters: {
        tech?: string;
        level?: string;
        goal?: string;
    };
};

export default function FilterControls({ currentFilters }: FilterControlsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [tech, setTech] = useState(currentFilters.tech || '');
    const [level, setLevel] = useState(currentFilters.level || '');
    const [goal, setGoal] = useState(currentFilters.goal || '');

    useEffect(() => {
        setTech(searchParams.get('tech') || '');
        setLevel(searchParams.get('level') || '');
        setGoal(searchParams.get('goal') || '');
    }, [searchParams]);


    const handleFilterChange = () => {
        const params = new URLSearchParams(searchParams);

        if (tech) params.set('tech', tech); else params.delete('tech');
        if (level) params.set('level', level); else params.delete('level');
        if (goal) params.set('goal', goal); else params.delete('goal');

        router.push(`/?${params.toString()}`, { scroll: false });
    };

    const handleResetFilters = () => {
        setTech('');
        setLevel('');
        setGoal('');
        router.push('/', { scroll: false });
    };


    const inputBaseClasses = "block w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white";
    const labelClasses = "block text-xs font-medium text-gray-400 mb-1";

    return (
        <div className="flex flex-wrap items-end gap-4 mb-6">
            <div>
                <label htmlFor="tech-filter" className={labelClasses}>Tech:</label>
                <input
                    id="tech-filter"
                    type="text"
                    value={tech}
                    onChange={(e) => setTech(e.target.value.toLowerCase())}
                    placeholder="e.g., rust"
                    className={`${inputBaseClasses} min-w-[150px]`}
                />
            </div>
            <div>
                <label htmlFor="level-filter" className={labelClasses}>Level:</label>
                <select id="level-filter" value={level} onChange={(e) => setLevel(e.target.value)} className={`${inputBaseClasses} min-w-[150px]`}>
                    <option value="">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                </select>
            </div>
            <div>
                <label htmlFor="goal-filter" className={labelClasses}>Goal:</label>
                <select id="goal-filter" value={goal} onChange={(e) => setGoal(e.target.value)} className={`${inputBaseClasses} min-w-[150px]`}>
                    <option value="">All Goals</option>
                    <option value="BUILD">Build</option>
                    <option value="LEARN">Learn</option>
                    <option value="SOLVE">Solve</option>
                </select>
            </div>
            <button
                onClick={handleFilterChange}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >Apply Filters</button>
            <button
                onClick={handleResetFilters}
                className="px-4 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md transition-colors"
            >Reset</button>
        </div>
    );
}