import type { ValueLabel } from "~/types/shared";

export default function DetailRow({ label, value }: ValueLabel) {
	return (
		<div className="grid gap-1 border-b border-border/80 py-4 last:border-b-0 sm:grid-cols-[minmax(9rem,0.7fr)_minmax(0,1.3fr)] sm:items-center sm:gap-4">
			<dt className="text-sm text-muted">{label}</dt>
			<dd className="wrap-break text-sm font-medium text-foreground">
				{value}
			</dd>
		</div>
	);
}
