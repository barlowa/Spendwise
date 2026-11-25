import { Button, Card } from "@heroui/react";
import { HiArrowRight } from "react-icons/hi2";
import ActivityRow from "~/features/home/components/ActivityRow";
import EmptyActivity from "~/features/home/components/EmptyActivity";
import type { HomeActivityItem } from "~/features/home/types";

interface Props {
	transactions: HomeActivityItem[];
	onViewAll: () => void;
	onAddTransaction: () => void;
}

export default function RecentActivityPanel({
	transactions,
	onViewAll,
	onAddTransaction,
}: Props) {
	return (
		<Card className="overflow-hidden border border-border bg-surface shadow-sm">
			<Card.Header className="flex-row items-center justify-between gap-4 border-b border-border px-5 py-5 sm:px-6">
				<div>
					<Card.Title>Recent activity</Card.Title>
					<Card.Description className="mt-1">
						Your latest spending entries
					</Card.Description>
				</div>
				<Button variant="ghost" size="sm" onPress={onViewAll}>
					View all
					<HiArrowRight aria-hidden="true" className="size-4" />
				</Button>
			</Card.Header>
			<Card.Content className="divide-y divide-border p-0">
				{transactions.length > 0 ? (
					transactions.map((transaction) => (
						<ActivityRow key={transaction.id} transaction={transaction} />
					))
				) : (
					<EmptyActivity onAddTransaction={onAddTransaction} />
				)}
			</Card.Content>
		</Card>
	);
}
