
import { Component, JSX, splitProps, Show } from "solid-js";

type ButtonProps = {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    isLoading?: boolean;
} & JSX.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: Component<ButtonProps> = (props) => {
    const [local, others] = splitProps(props, ["variant", "isLoading", "class", "children", "disabled"]);

    const variants = {
        primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 focus:ring-indigo-100",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm focus:ring-slate-100",
        danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/20 focus:ring-red-100",
        ghost: "text-indigo-600 hover:bg-indigo-50 border-transparent",
    };

    const variantClass = variants[local.variant || "primary"];

    return (
        <button
            class={`px-6 py-2.5 font-semibold rounded-xl focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2 ${variantClass} ${local.class || ""}`}
            disabled={local.disabled || local.isLoading}
            {...others}
        >
            <Show when={local.isLoading}>
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </Show>
            {local.children}
        </button>
    );
};
