
import { Component, JSX, Show, splitProps } from "solid-js";

type InputProps = {
    label?: string;
    error?: string;
    wrapperClass?: string;
} & JSX.InputHTMLAttributes<HTMLInputElement>;

export const Input: Component<InputProps> = (props) => {
    const [local, others] = splitProps(props, ["label", "error", "class", "wrapperClass"]);

    return (
        <div class={local.wrapperClass}>
            <Show when={local.label}>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                    {local.label}
                </label>
            </Show>
            <input
                class={`w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed ${local.error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""} ${local.class || ""}`}
                {...others}
            />
            <Show when={local.error}>
                <p class="mt-1 text-sm text-red-500">{local.error}</p>
            </Show>
        </div>
    );
};
