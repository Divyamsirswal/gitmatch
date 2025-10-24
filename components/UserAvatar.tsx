"use client";
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';
import { useMemo } from 'react';

type UserAvatarProps = {
    userId: string;
};

export default function UserAvatar({ userId }: UserAvatarProps) {
    if (!userId) return null;

    const avatarSvg = useMemo(() => {
        return createAvatar(micah, {
            seed: userId,
            radius: 50,
            backgroundType: ['solid', 'gradientLinear'],
            backgroundColor: [
                '#65c9ff', '#ffb45a', '#95ff88', '#ff8f8f', '#a48fff'
            ]
        }).toDataUri();
    }, [userId]);

    return (
        <img
            src={avatarSvg}
            alt="User Avatar"
            className="h-10 w-10 rounded-full shrink-0"
        />
    );
}