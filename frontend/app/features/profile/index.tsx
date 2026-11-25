import { useUser } from "@auth0/auth0-react-router";
import { requireSession } from "@auth0/auth0-react-router/server";
import { HiBanknotes } from "react-icons/hi2";
import Link from "~/components/Link";
import SecurityCard from "~/features/profile//components/SecurityCard";
import DetailsCard from "~/features/profile/components/DetailsCard";
import SummaryCard from "~/features/profile/components/SummaryCard";
import type { Route } from "./+types";

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireSession(request);
	return null;
};

export function meta() {
	return [
		{ title: "Your profile | Spendwise" },
		{
			name: "description",
			content: "View the account details connected to your Spendwise profile.",
		},
	];
}

export default function Profile() {
	const user = useUser();
	const name = user?.name?.trim() || "Spendwise user";
	const email = user?.email?.trim() || "";

	return (
		<div className="mx-auto max-w-5xl space-y-9 pb-12">
			<header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
						Account overview
					</p>
					<h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						Your profile
					</h1>
				</div>
				<Link
					to="/transactions"
					className="flex gap-3 text-accent"
					icon={<HiBanknotes />}
				>
					Go to transactions
				</Link>
			</header>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.6fr)]">
				<div className="space-y-6">
					<SummaryCard
						name={name}
						email={email}
						picture={user?.picture}
						emailVerified={user?.email_verified}
					/>
					<DetailsCard />
				</div>
				<SecurityCard />
			</div>
		</div>
	);
}
