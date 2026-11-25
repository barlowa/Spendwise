import { useUser } from "@auth0/auth0-react-router";
import { requireSession } from "@auth0/auth0-react-router/server";
import axios from "axios";
import { useNavigate } from "react-router";
import QuickLinkPanel from "~/features/home/components/QuickLinkPanel";
import RecentActivityPanel from "~/features/home/components/RecentActivityPanel";
import TotalAmountCard from "~/features/home/components/TotalAmountCard";
import TransactionCountCard from "~/features/home/components/TransactionCountCard";
import WelcomePanel from "~/features/home/components/WelcomePanel";
import type { HomeActivityItem } from "~/features/home/types";
import type { GetTransactionsResponse } from "~/features/transactions/types";
import { currencyFormatter, dateFormatter } from "~/utils/convert";
import type { Route } from "./+types";

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireSession(request);

	const response = await axios.get<GetTransactionsResponse>("/transactions");
	return { transactions: response.data };
};

export function meta() {
	return [
		{ title: "Home | Spendwise" },
		{
			name: "description",
			content: "A quick overview of your spending and recent transactions.",
		},
	];
}

function getFirstName(name?: string) {
	return name?.trim().split(/\s+/)[0] || "there";
}

function getRecentActivity(
	transactions: GetTransactionsResponse,
): HomeActivityItem[] {
	return [...transactions]
		.sort(
			(first, second) =>
				new Date(second.created_at).getTime() -
				new Date(first.created_at).getTime(),
		)
		.slice(0, 5)
		.map((transaction) => ({
			id: transaction.id,
			description: transaction.description,
			date: dateFormatter.format(new Date(transaction.created_at)),
			amount: currencyFormatter.format(Number(transaction.amount)),
		}));
}

type HomeProps = Pick<Route.ComponentProps, "loaderData">;

export function HomePage({ loaderData }: HomeProps) {
	const user = useUser();
	const navigate = useNavigate();
	const transactions = loaderData?.transactions ?? [];
	const totalAmount = transactions.reduce(
		(total, transaction) => total + Number(transaction.amount),
		0,
	);
	const recentActivity = getRecentActivity(transactions);
	const goToTransactions = () => navigate("/transactions");
	const goToProfile = () => navigate("/profile");

	return (
		<div className="mx-auto max-w-6xl space-y-8 pb-12">
			<WelcomePanel
				firstName={getFirstName(user?.name)}
				onAddTransaction={goToTransactions}
			/>
			<section
				aria-label="Spending summary"
				className="grid gap-8 sm:grid-cols-2"
			>
				<TotalAmountCard totalAmount={currencyFormatter.format(totalAmount)} />
				<TransactionCountCard transactionCount={transactions.length} />
			</section>

			<RecentActivityPanel
				transactions={recentActivity}
				onViewAll={goToTransactions}
				onAddTransaction={goToTransactions}
			/>
			<QuickLinkPanel
				onTransactions={goToTransactions}
				onProfile={goToProfile}
			/>
		</div>
	);
}

export default HomePage;
