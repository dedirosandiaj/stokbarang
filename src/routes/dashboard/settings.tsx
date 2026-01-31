import { Title } from "@solidjs/meta";

export default function Settings() {
    return (
        <div>
            <Title>Settings | ElaApp</Title>
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                <p class="text-slate-500 mt-2">App configuration and preferences.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <p class="text-slate-500">Settings form will go here.</p>
            </div>
        </div>
    );
}
