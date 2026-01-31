import { Title } from "@solidjs/meta";

export default function BadStock() {
    return (
        <div>
            <Title>Bad Stock | ElaApp</Title>
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-slate-900 tracking-tight">Bad Stock</h1>
                <p class="text-slate-500 mt-2">Manage damaged or returned goods.</p>
            </div>

            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <p class="text-slate-500">Bad Stock management table will go here.</p>
            </div>
        </div>
    );
}
