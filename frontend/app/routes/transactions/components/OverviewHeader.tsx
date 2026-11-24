import { Chip } from "@heroui/react";
import { HiOutlineBanknotes } from "react-icons/hi2";
import type { Transaction } from "~/routes/transactions/types";

interface Props {
	transactions?: Transaction[];
}

export default function OverviewHeader({ transactions }: Props) {
	const total = transactions?.reduce(
		(total, transaction) => total + Number(transaction.amount),
		0,
	);

	return (
		<div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<Chip variant="soft" size="sm" className="mb-3">
					Overview
				</Chip>
				<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
					Transactions
				</h1>
				<p className="mt-2 text-sm text-muted">
					Add, review, and manage your spending.
				</p>
			</div>
			<div className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 shadow-sm">
				<div className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
					<HiOutlineBanknotes className="size-5" />
				</div>
				<div>
					<p className="text-xs text-muted">Total transactions</p>
					<p className="text-lg font-semibold tabular-nums">
						$
						{total?.toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</p>
				</div>
			</div>
		</div>
	);
}
