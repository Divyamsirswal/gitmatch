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


    const filterGroupStyle: React.CSSProperties = {
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
    };
    const selectStyle: React.CSSProperties = {
        padding: '8px 10px',
        borderRadius: '4px',
        border: '1px solid #555',
        background: '#333',
        color: 'white',
        minWidth: '150px'
    };
    const buttonStyle: React.CSSProperties = {
        padding: '8px 15px',
        borderRadius: '5px',
        border: 'none',
        background: '#0070f3',
        color: 'white',
        cursor: 'pointer',
        height: 'fit-content'
    };
    const resetButtonStyle: React.CSSProperties = { ...buttonStyle, background: '#555' };

    return (
        <div style={filterGroupStyle}>
            <div>
                <label htmlFor="tech-filter" style={{ fontSize: '0.9em', display: 'block', marginBottom: '3px' }}>Tech:</label>
                <input
                    id="tech-filter"
                    type="text"
                    value={tech}
                    onChange={(e) => setTech(e.target.value.toLowerCase())}
                    placeholder="e.g., rust, nextjs"
                    style={selectStyle}
                />
            </div>
            <div>
                <label htmlFor="level-filter" style={{ fontSize: '0.9em', display: 'block', marginBottom: '3px' }}>Level:</label>
                <select id="level-filter" value={level} onChange={(e) => setLevel(e.target.value)} style={selectStyle}>
                    <option value="">All Levels</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                </select>
            </div>
            <div>
                <label htmlFor="goal-filter" style={{ fontSize: '0.9em', display: 'block', marginBottom: '3px' }}>Goal:</label>
                <select id="goal-filter" value={goal} onChange={(e) => setGoal(e.target.value)} style={selectStyle}>
                    <option value="">All Goals</option>
                    <option value="BUILD">Build</option>
                    <option value="LEARN">Learn</option>
                    <option value="SOLVE">Solve</option>
                </select>
            </div>
            <button onClick={handleFilterChange} style={buttonStyle}>Apply Filters</button>
            <button onClick={handleResetFilters} style={resetButtonStyle}>Reset</button>
        </div>
    );
}