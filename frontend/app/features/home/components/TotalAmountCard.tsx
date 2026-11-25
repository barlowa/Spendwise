import { Card } from "@heroui/react";
import { HiOutlineBanknotes } from "react-icons/hi2";

interface Props {
	totalAmount: string;
}

export default function SpendingSummaryCard({ totalAmount }: Props) {
	return (
		<Card className="border border-border bg-surface shadow-sm">
			<Card.Content className="flex items-start justify-between gap-4 p-5 sm:p-6">
				<div>
					<p className="text-sm text-muted">Total amount tracked</p>
					<p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
						{totalAmount}
					</p>
					<p className="mt-1 text-xs text-muted">Across all transactions</p>
				</div>
				<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
					<HiOutlineBanknotes aria-hidden="true" className="size-5" />
				</div>
			</Card.Content>
		</Card>
	);
}
