export default function ContentLoader() {
    return (
        <div class="flex flex-col items-center justify-center p-12 text-slate-400 gap-4">
            <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p class="text-sm font-medium animate-pulse">Loading content...</p>
        </div>
    );
}
