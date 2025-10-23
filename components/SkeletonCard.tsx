export default function SkeletonCard() {
    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md w-full animate-pulse">
            <div className="h-4 bg-gray-600 rounded w-3/4 mb-3"></div>
            <div className="flex flex-wrap gap-2 mb-3">
                <div className="h-3 bg-gray-600 rounded-full w-12"></div>
                <div className="h-3 bg-gray-600 rounded-full w-16"></div>
            </div>
            <div className="h-3 bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-600 rounded w-1/3 mb-2"></div>
            <div className="h-2 bg-gray-600 rounded w-1/4 mt-1"></div>
        </div>
    );
}