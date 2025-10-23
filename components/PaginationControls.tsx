'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';

type PaginationControlsProps = {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    itemsPerPage: number;
};

export default function PaginationControls({
    currentPage,
    totalPages,
    totalCount,
    itemsPerPage
}: PaginationControlsProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const hasPreviousPage = currentPage > 1;
    const hasNextPage = currentPage < totalPages;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    const buttonBaseStyle = "px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const activeButtonStyle = "bg-blue-600 hover:bg-blue-700";
    const disabledButtonStyle = "bg-gray-700 cursor-not-allowed";

    const startItem = totalCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalCount);


    if (totalPages <= 1) {
        return null;
    }


    return (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-400 text-sm">
            <div className="text-xs sm:text-sm">
                Showing <span className="font-medium text-gray-200">{startItem}</span> to <span className="font-medium text-gray-200">{endItem}</span> of <span className="font-medium text-gray-200">{totalCount}</span> results
            </div>
            <div className="flex items-center gap-2">
                <Link
                    href={createPageURL(currentPage - 1)}
                    scroll={false} 
                    className={`${buttonBaseStyle} ${hasPreviousPage ? activeButtonStyle : disabledButtonStyle} ${!hasPreviousPage ? 'pointer-events-none' : ''}`}
                    aria-disabled={!hasPreviousPage}
                    tabIndex={!hasPreviousPage ? -1 : undefined}
                >
                    Previous
                </Link>
                <span className="px-2"> Page {currentPage} of {totalPages} </span>
                <Link
                    href={createPageURL(currentPage + 1)}
                    scroll={false} 
                    className={`${buttonBaseStyle} ${hasNextPage ? activeButtonStyle : disabledButtonStyle} ${!hasNextPage ? 'pointer-events-none' : ''}`}
                    aria-disabled={!hasNextPage}
                    tabIndex={!hasNextPage ? -1 : undefined}
                >
                    Next
                </Link>
            </div>
        </div>
    );
}