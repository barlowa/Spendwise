import { Card } from "@heroui/react";
import {
	HiOutlineArrowUpRight,
	HiOutlineReceiptPercent,
	HiOutlineUserCircle,
} from "react-icons/hi2";

interface Props {
	onTransactions: () => void;
	onProfile: () => void;
}

export default function QuickLinkPanel({ onTransactions, onProfile }: Props) {
	return (
		<Card className="border border-border bg-surface shadow-sm">
			<Card.Header className="px-5 pt-5 sm:px-6 sm:pt-6">
				<Card.Title>Quick links</Card.Title>
				<Card.Description className="mt-1">
					Go straight to what you need
				</Card.Description>
			</Card.Header>
			<Card.Content className="grid gap-3 px-5 pb-5 sm:grid-cols-2 sm:px-6 sm:pb-6">
				<button
					type="button"
					onClick={onTransactions}
					className="group flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:border-accent/40 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
				>
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
						<HiOutlineReceiptPercent aria-hidden="true" className="size-5" />
					</span>
					<span className="min-w-0 flex-1">
						<span className="block font-medium text-foreground">
							Transactions
						</span>
						<span className="mt-1 block text-sm text-muted">
							Review or update activity
						</span>
					</span>
					<HiOutlineArrowUpRight
						aria-hidden="true"
						className="size-4 shrink-0 text-muted transition group-hover:text-accent"
					/>
				</button>
				<button
					type="button"
					onClick={onProfile}
					className="group flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition hover:border-accent/40 hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
				>
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-secondary text-foreground">
						<HiOutlineUserCircle aria-hidden="true" className="size-5" />
					</span>
					<span className="min-w-0 flex-1">
						<span className="block font-medium text-foreground">
							Your profile
						</span>
						<span className="mt-1 block text-sm text-muted">
							Manage account details
						</span>
					</span>
					<HiOutlineArrowUpRight
						aria-hidden="true"
						className="size-4 shrink-0 text-muted transition group-hover:text-accent"
					/>
				</button>
			</Card.Content>
		</Card>
	);
}
