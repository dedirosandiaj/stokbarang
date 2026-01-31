
import { Component, JSX, Show, splitProps, For } from "solid-js";

type SelectProps = {
    label?: string;
    error?: string;
    wrapperClass?: string;
    options: { label: string; value: string | number }[];
} & JSX.SelectHTMLAttributes<HTMLSelectElement>;

export const Select: Component<SelectProps> = (props) => {
    const [local, others] = splitProps(props, ["label", "error", "class", "wrapperClass", "options"]);

    return (
        <div class={local.wrapperClass}>
            <Show when={local.label}>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                    {local.label}
                </label>
            </Show>
            <div class="relative">
                <select
                    class={`w-full rounded-xl border-slate-200 bg-slate-50 p-2.5 text-sm shadow-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none appearance-none font-medium text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${local.error ? "border-red-500 focus:border-red-500 focus:ring-red-200" : ""} ${local.class || ""}`}
                    {...others}
                >
                    <For each={local.options}>
                        {(option) => (
                            <option value={option.value}>{option.label}</option>
                        )}
                    </For>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-down"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
            </div>
            <Show when={local.error}>
                <p class="mt-1 text-sm text-red-500">{local.error}</p>
            </Show>
        </div>
    );
};
