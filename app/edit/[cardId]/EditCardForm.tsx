"use client";

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateCard } from '@/app/actions';
import toast from 'react-hot-toast';
import { AVAILABILITY_SLOTS, TIMEZONES } from '@/lib/constants';

type CardData = {
    id: string;
    created_at: string;
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    email?: string | null;
    timezone?: string | null;
    availability?: string[] | null;
    user_id: string;
};

type EditFormData = {
    goal_type: string;
    tech_tags: string[];
    description: string;
    skill_level: string;
    vibe: string;
    contact_handle: string;
    contact_method: string;
    email?: string | null;
    timezone?: string | null;
    availability?: string[];
};

const inputBaseClasses = "mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white";
const labelClasses = "block text-sm font-medium text-gray-300";
const fieldsetClasses = "border border-gray-700 rounded-lg p-4 space-y-4";
const legendClasses = "text-lg font-semibold text-white px-2";

export default function EditCardForm({ card }: { card: CardData }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState<EditFormData>({
        goal_type: card.goal_type,
        tech_tags: card.tech_tags || [],
        description: card.description || '',
        skill_level: card.skill_level,
        vibe: card.vibe,
        contact_handle: card.contact_handle || '',
        contact_method: card.contact_method,
        email: card.email || '',
        timezone: card.timezone || '',
        availability: card.availability || [],
    });
    const [techTagInput, setTechTagInput] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentAvailability = prev.availability || [];
            if (checked) {
                return { ...prev, availability: [...currentAvailability, value] };
            } else {
                return { ...prev, availability: currentAvailability.filter(slot => slot !== value) };
            }
        });
    };

    const handleAddTag = () => {
        const newTag = techTagInput.trim().toLowerCase();
        if (!newTag) { toast.error("Tag cannot be empty."); return; }
        if (formData.tech_tags.length >= 5) { toast.error("Maximum of 5 tags allowed."); return; }
        if (formData.tech_tags.includes(newTag)) { toast.error("Tag already added."); return; }
        setFormData((prev) => ({ ...prev, tech_tags: [...prev.tech_tags, newTag] }));
        setTechTagInput("");
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev) => ({ ...prev, tech_tags: prev.tech_tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.tech_tags.length === 0 || formData.tech_tags.length > 5) {
            toast.error("Please use between 1 and 5 tech tags."); return;
        }

        startTransition(async () => {
            const dataToUpdate: EditFormData = {
                ...formData,
                email: formData.email?.trim() || null,
                timezone: formData.timezone || null,
                availability: (formData.availability && formData.availability.length > 0) ? formData.availability : undefined,
            };
            const result = await updateCard(card.id, dataToUpdate);

            if (result && result.success === false) {
                toast.error(`Failed to update card: ${result.error || 'Unknown error'}`);
            } else {
                toast.success("Card updated successfully!");
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-semibold text-white">Edit Your Goal</h1>
                    <p className="text-gray-400 text-sm mt-2">Make changes to your card and save.</p>
                </div>

                <fieldset className={fieldsetClasses}>
                    <legend className={legendClasses}>1. Your Goal</legend>
                    <div>
                        <label htmlFor="goal_type" className={labelClasses}>What do you want to do?</label>
                        <select id="goal_type" name="goal_type" value={formData.goal_type} onChange={handleChange} className={inputBaseClasses} required>
                            <option value="BUILD">Build a Project</option>
                            <option value="LEARN">Learn a Skill</option>
                            <option value="SOLVE">Solve Problems</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className={labelClasses}>Description (Max 150 chars):</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required maxLength={150} className={`${inputBaseClasses} min-h-[80px] resize-y`} />
                    </div>
                    <div>
                        <label htmlFor="tech-input" className={labelClasses}>Tech Tags (Max 5):</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input id="tech-input" type="text" value={techTagInput} onChange={(e) => setTechTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder="Add a tag" className={`${inputBaseClasses} grow`} />
                            <button type="button" onClick={handleAddTag} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md transition-colors shrink-0">Add</button>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {formData.tech_tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center bg-blue-600 text-white text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-blue-200 hover:bg-blue-700 hover:text-white focus:outline-none focus:bg-blue-700 focus:text-white" aria-label={`Remove ${tag} tag`}>&times;</button>
                                </span>
                            ))}
                        </div>
                    </div>
                </fieldset>

                <fieldset className={fieldsetClasses}>
                    <legend className={legendClasses}>2. Your Details</legend>
                    <div>
                        <label htmlFor="skill_level" className={labelClasses}>Skill Level:</label>
                        <select id="skill_level" name="skill_level" value={formData.skill_level} onChange={handleChange} className={inputBaseClasses} required>
                            <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="vibe" className={labelClasses}>Vibe:</label>
                        <select id="vibe" name="vibe" value={formData.vibe} onChange={handleChange} className={inputBaseClasses} required>
                            <option value="CASUAL">Casual</option><option value="FOCUSED">Focused</option><option value="INTENSE">Intense</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="contact_method" className={labelClasses}>Contact Method:</label>
                        <select id="contact_method" name="contact_method" value={formData.contact_method} onChange={handleChange} className={inputBaseClasses} required>
                            <option value="DISCORD">Discord</option><option value="TELEGRAM">Telegram</option><option value="LINKEDIN">LinkedIn</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="contact_handle" className={labelClasses}>Contact Handle:</label>
                        <input id="contact_handle" type="text" name="contact_handle" value={formData.contact_handle} onChange={handleChange} required className={inputBaseClasses} />
                    </div>
                </fieldset>

                <fieldset className={fieldsetClasses}>
                    <legend className={legendClasses}>3. Scheduling (Optional)</legend>
                    <div>
                        <label htmlFor="timezone" className={labelClasses}>Your Timezone:</label>
                        <select id="timezone" name="timezone" value={formData.timezone || ''} onChange={handleChange} className={inputBaseClasses}>
                            <option value="">Select your timezone</option>
                            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Your Availability:</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                            {AVAILABILITY_SLOTS.map(slot => (
                                <label key={slot.id} className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox" name="availability" value={slot.id}
                                        checked={formData.availability?.includes(slot.id)}
                                        onChange={handleAvailabilityChange}
                                        className="rounded border-gray-600 bg-gray-700 text-blue-600 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-offset-0 focus:ring-opacity-50"
                                    />
                                    <span>{slot.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </fieldset>

                <fieldset className={fieldsetClasses}>
                    <legend className={legendClasses}>4. Notifications (Optional)</legend>
                    <div>
                        <label htmlFor="email" className={labelClasses}>Email:</label>
                        <span className="text-xs text-gray-400 block mb-1">Get a reminder before your card expires. Never shared publicly.</span>
                        <input id="email" type="email" name="email" value={formData.email || ''} onChange={handleChange} placeholder="you@example.com" className={inputBaseClasses} />
                    </div>
                </fieldset>

                <div className="flex gap-4 items-center">
                    <button type="submit" disabled={isPending} className="w-full flex justify-center items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:opacity-70 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-800 text-base">
                        {isPending ? (
                            <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Updating...</>
                        ) : ("Update Goal")}
                    </button>
                    <Link href="/" className="block w-full text-center px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-md transition-colors text-base">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
