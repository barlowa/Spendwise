import { Button, Chip } from "@heroui/react";
import { HiOutlinePlus } from "react-icons/hi2";

type Props = {
	firstName: string;
	onAddTransaction: () => void;
};

export default function WelcomePanel({ firstName, onAddTransaction }: Props) {
	return (
		<section className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface px-6 py-8 shadow-sm sm:px-9 sm:py-10">
			<div
				aria-hidden="true"
				className="absolute -right-20 -top-28 -z-10 size-80 rounded-full bg-accent/10 blur-3xl"
			/>
			<div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
				<div className="max-w-2xl">
					<Chip variant="soft" color="accent" size="sm">
						Your money, in view
					</Chip>
					<h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						Welcome back, {firstName}.
					</h1>
					<p className="mt-3 max-w-xl leading-7 text-muted">
						Here’s your personal spending overview. Keep your activity organized
						and see what you’ve been tracking lately.
					</p>
				</div>
				<Button
					size="lg"
					onPress={onAddTransaction}
					className="shrink-0"
				>
					<HiOutlinePlus aria-hidden="true" className="size-4" />
					Add a transaction
				</Button>
			</div>
		</section>
	);
}
