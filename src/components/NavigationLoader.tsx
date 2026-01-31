import { useIsRouting } from "@solidjs/router";
import { Show, createSignal, createEffect } from "solid-js";

export default function NavigationLoader() {
    const isRouting = useIsRouting();
    const [isVisible, setIsVisible] = createSignal(false);

    createEffect(() => {
        if (isRouting()) {

            setIsVisible(true);
        } else {
            // Keep it visible for a moment to ensure it's seen (UX)
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 500); // 500ms minimum fade out delay
            return () => clearTimeout(timer);
        }
    });

    return (
        <Show when={isVisible()}>
            <div class="fixed top-0 left-0 w-full h-1.5 z-[100] bg-indigo-100/50 backdrop-blur-sm pointer-events-none">
                <div class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-[progress_1s_ease-in-out_infinite] origin-left w-full shadow-lg shadow-indigo-500/50"></div>
            </div>

            {/* Define custom keyframe animation style locally if not available in tailwind config */}
            <style>
                {`
                @keyframes progress {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(-20%); }
                    100% { transform: translateX(100%); }
                }
                `}
            </style>
        </Show>
    );
}
