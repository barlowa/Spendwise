import { Card, Chip, Link } from "@heroui/react";
import {
	HiArrowRight,
	HiOutlineBanknotes,
	HiOutlineCalendarDays,
	HiOutlinePencilSquare,
} from "react-icons/hi2";

export function meta() {
	return [
		{ title: "Spendwise | Keep your spending in view" },
		{
			name: "description",
			content:
				"Spendwise helps you record, review, and manage everyday spending.",
		},
	];
}

const features = [
	{
		icon: HiOutlineBanknotes,
		title: "Record spending",
		description:
			"Add a description and amount to keep track of everyday transactions.",
	},
	{
		icon: HiOutlinePencilSquare,
		title: "Make updates",
		description:
			"Edit transaction details when you need to correct or update an entry.",
	},
	{
		icon: HiOutlineCalendarDays,
		title: "Review activity",
		description:
			"See your recent transactions together in one straightforward list.",
	},
];

export default function LandingPage() {
	return (
		<div className="pb-20 pt-10 sm:px-6 sm:pt-16 lg:px-8">
			<section className="grid items-center gap-12 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
				<div className="max-w-2xl">
					<h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
						Know where your <span className="text-accent">money goes.</span>
					</h1>
					<p className="mt-6 max-w-xl text-lg leading-8 text-muted">
						Spendwise is a personal finance and expense-tracking app that helps
						you keep everyday spending in view. Start by adding, updating, and
						reviewing transactions in one clear place.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-5">
						<Link
							href="/login"
							className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:opacity-90"
						>
							Sign up to get started
							<HiArrowRight aria-hidden="true" className="size-4" />
						</Link>
						<Link
							href="#features"
							className="inline-flex items-center gap-2 font-medium text-foreground hover:text-accent"
						>
							Explore the basics
						</Link>
					</div>
					<p className="mt-4 text-sm text-muted">
						Phase one: simple, personal transaction tracking.
					</p>
				</div>

				<div className="relative mx-auto w-full max-w-xl">
					<div
						aria-hidden="true"
						className="absolute -inset-6 rounded-[2rem] bg-accent/10 blur-2xl"
					/>
					<Card className="relative border border-border bg-surface shadow-[0_28px_80px_-36px_rgba(16,185,129,0.5)]">
						<Card.Header className="flex-row items-start justify-between gap-4 border-b border-border pb-5">
							<div>
								<Card.Title>Recent transactions</Card.Title>
								<Card.Description className="mt-1">
									A clear view of your everyday spending
								</Card.Description>
							</div>
							<Chip variant="soft" color="success" size="sm">
								Sample
							</Chip>
						</Card.Header>
						<Card.Content className="space-y-1 py-3">
							{[
								{ description: "Market", date: "Today", amount: "$46.80" },
								{
									description: "Coffee shop",
									date: "Yesterday",
									amount: "$5.40",
								},
								{
									description: "Mobile plan",
									date: "May 12",
									amount: "$24.00",
								},
							].map((transaction) => (
								<div
									className="flex items-center justify-between gap-4 rounded-xl px-3 py-4 transition hover:bg-surface-secondary"
									key={transaction.description}
								>
									<div className="flex min-w-0 items-center gap-3">
										<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
											<HiOutlineBanknotes
												aria-hidden="true"
												className="size-5"
											/>
										</div>
										<div className="min-w-0">
											<p className="truncate font-medium text-foreground">
												{transaction.description}
											</p>
											<p className="text-sm text-muted">{transaction.date}</p>
										</div>
									</div>
									<p className="shrink-0 font-semibold tabular-nums text-foreground">
										{transaction.amount}
									</p>
								</div>
							))}
						</Card.Content>
						<Card.Footer className="border-t border-border pt-4">
							<p className="text-sm text-muted">
								An example of the simple transaction list you can manage.
							</p>
						</Card.Footer>
					</Card>
				</div>
			</section>

			<section id="features" className="scroll-mt-24 py-12 sm:py-16">
				<div className="mx-auto max-w-2xl text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
						Getting started
					</p>
					<h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						The essentials, made simple.
					</h2>
					<p className="mt-4 text-muted">
						Spendwise is in its first phase. For now, focus on keeping your
						transactions organized and up to date.
					</p>
				</div>
				<div className="mt-10 grid gap-4 md:grid-cols-3">
					{features.map(({ icon: Icon, title, description }) => (
						<Card
							className="border border-border bg-surface transition hover:-translate-y-1 hover:shadow-lg"
							key={title}
						>
							<Card.Content className="p-6">
								<div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
									<Icon aria-hidden="true" className="size-5" />
								</div>
								<h3 className="text-lg font-semibold text-foreground">
									{title}
								</h3>
								<p className="mt-2 leading-6 text-muted">{description}</p>
							</Card.Content>
						</Card>
					))}
				</div>
			</section>

			<section className="mt-8 rounded-3xl border border-border bg-surface-secondary px-6 py-10 text-center sm:px-10 sm:py-14">
				<h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
					Ready to keep your spending in view?
				</h2>
				<p className="mx-auto mt-3 max-w-xl text-muted">
					Create an account and start building a clear record of your
					transactions.
				</p>
				<Link
					href="/login"
					className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition hover:opacity-90"
				>
					Create your account
					<HiArrowRight aria-hidden="true" className="size-4" />
				</Link>
			</section>
		</div>
	);
}
