import { Button } from "@heroui/react";
import { HiArrowRight, HiOutlineBanknotes } from "react-icons/hi2";

type Props = {
	onAddTransaction: () => void;
};

export default function EmptyActivity({ onAddTransaction }: Props) {
	return (
		<div className="flex flex-col items-center px-6 py-12 text-center">
			<div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
				<HiOutlineBanknotes aria-hidden="true" className="size-6" />
			</div>
			<p className="mt-4 font-medium text-foreground">Your activity starts here</p>
			<p className="mt-1 max-w-sm text-sm leading-6 text-muted">
				Add your first transaction and it’ll show up in this overview.
			</p>
			<Button
				variant="secondary"
				size="sm"
				className="mt-5"
				onPress={onAddTransaction}
			>
				Add a transaction
				<HiArrowRight aria-hidden="true" className="size-4" />
			</Button>
		</div>
	);
}
