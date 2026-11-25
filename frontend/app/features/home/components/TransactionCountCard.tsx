import { Card } from "@heroui/react";
import { HiOutlineReceiptPercent } from "react-icons/hi2";

interface Props {
	transactionCount: number;
}

export default function TransactionCountCard({ transactionCount }: Props) {
	return (
		<Card className="border border-border bg-surface shadow-sm">
			<Card.Content className="flex items-start justify-between gap-4 p-5 sm:p-6">
				<div>
					<p className="text-sm text-muted">Transactions recorded</p>
					<p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
						{transactionCount}
					</p>
					<p className="mt-1 text-xs text-muted">Entries you’ve recorded</p>
				</div>
				<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-secondary text-foreground">
					<HiOutlineReceiptPercent aria-hidden="true" className="size-5" />
				</div>
			</Card.Content>
		</Card>
	);
}
