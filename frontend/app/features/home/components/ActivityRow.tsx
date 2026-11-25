import { HiOutlineBanknotes } from "react-icons/hi2";
import type { HomeActivityItem } from "~/features/home/types";

type Props = {
	transaction: HomeActivityItem;
};

export default function ActivityRow({ transaction }: Props) {
	return (
		<div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
					<HiOutlineBanknotes aria-hidden="true" className="size-5" />
				</div>
				<div className="min-w-0">
					<p className="truncate font-medium text-foreground">
						{transaction.description}
					</p>
					<p className="mt-1 text-sm text-muted">{transaction.date}</p>
				</div>
			</div>
			<p className="shrink-0 font-semibold tabular-nums text-foreground">
				{transaction.amount}
			</p>
		</div>
	);
}
