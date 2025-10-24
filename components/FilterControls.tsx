"use client";

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type FilterControlsProps = {
    currentFilters: {
        tech?: string;
        level?: string;
        goal?: string;
    };
};

export default function FilterControls({ currentFilters }: FilterControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [tech, setTech] = useState(currentFilters.tech || '');
    const [level, setLevel] = useState(currentFilters.level || '');
    const [goal, setGoal] = useState(currentFilters.goal || '');

    const updateQueryParams = useCallback((newTech: string, newLevel: string, newGoal: string) => {
        const params = new URLSearchParams(searchParams);
        if (newTech) params.set('tech', newTech); else params.delete('tech');
        if (newLevel) params.set('level', newLevel); else params.delete('level');
        if (newGoal) params.set('goal', newGoal); else params.delete('goal');
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, router, pathname]);

    const debouncedUpdateTech = useDebouncedCallback((value: string) => {
        updateQueryParams(value, level, goal);
    }, 500);

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        setLevel(newLevel);
        updateQueryParams(tech, newLevel, goal);
    };

    const handleGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newGoal = e.target.value;
        setGoal(newGoal);
        updateQueryParams(tech, level, newGoal);
    };

    const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTech = e.target.value.toLowerCase();
        setTech(newTech);
        debouncedUpdateTech(newTech);
    };

    const handleResetFilters = () => {
        setTech('');
        setLevel('');
        setGoal('');
        router.push(pathname, { scroll: false });
    };

    useEffect(() => {
        setTech(searchParams.get('tech') || '');
        setLevel(searchParams.get('level') || '');
        setGoal(searchParams.get('goal') || '');
    }, [searchParams]);


    const inputBaseClasses = "block w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white";
    const labelClasses = "block text-xs font-medium text-gray-400 mb-1";
    const buttonStyle = "px-4 py-1.5 text-white text-sm rounded-md transition-colors";

    return (
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3 mb-6">
            <div>
                <label htmlFor="tech-filter" className={labelClasses}>Tech:</label>
                <input
                    id="tech-filter" type="text" value={tech}
                    onChange={handleTechChange}
                    placeholder="e.g., rust" className={`${inputBaseClasses} min-w-[150px]`}
                />
            </div>
            <div>
                <label htmlFor="level-filter" className={labelClasses}>Level:</label>
                <select id="level-filter" value={level}
                    onChange={handleLevelChange}
                    className={`${inputBaseClasses} min-w-[150px]`}>
                    <option value="">All Levels</option> <option value="BEGINNER">Beginner</option> <option value="INTERMEDIATE">Intermediate</option> <option value="ADVANCED">Advanced</option>
                </select>
            </div>
            <div>
                <label htmlFor="goal-filter" className={labelClasses}>Goal:</label>
                <select id="goal-filter" value={goal}
                    onChange={handleGoalChange}
                    className={`${inputBaseClasses} min-w-[150px]`}>
                    <option value="">All Goals</option> <option value="BUILD">Build</option> <option value="LEARN">Learn</option> <option value="SOLVE">Solve</option>
                </select>
            </div>
            <button onClick={handleResetFilters} className={`${buttonStyle} bg-gray-600 hover:bg-gray-500`}>Reset</button>
        </div>
    );
}