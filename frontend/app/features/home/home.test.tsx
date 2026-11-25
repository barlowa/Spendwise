import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivityRow from "~/features/home/components/ActivityRow";
import EmptyActivity from "~/features/home/components/EmptyActivity";
import QuickLinkPanel from "~/features/home/components/QuickLinkPanel";
import RecentActivityPanel from "~/features/home/components/RecentActivityPanel";
import TotalAmountCard from "~/features/home/components/TotalAmountCard";
import TransactionCountCard from "~/features/home/components/TransactionCountCard";
import WelcomePanel from "~/features/home/components/WelcomePanel";
import { HomePage, loader } from "~/features/home/index";
import type { HomeActivityItem } from "~/features/home/types";
import type { Transaction } from "~/features/transactions/types";
import { render, screen, userEvent } from "~/test/test-utils";
import { currencyFormatter } from "~/utils/convert";

const mocks = vi.hoisted(() => ({
	navigate: vi.fn(),
	useUser: vi.fn(),
	requireSession: vi.fn(),
	axiosGet: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router", () => ({
	useUser: mocks.useUser,
}));

vi.mock("@auth0/auth0-react-router/server", () => ({
	requireSession: mocks.requireSession,
}));

vi.mock("axios", () => ({
	default: { get: mocks.axiosGet },
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useNavigate: () => mocks.navigate,
	};
});

function makeTransaction(id: number, amount = `${id}.00`): Transaction {
	return {
		id,
		user_id: 1,
		description: `Transaction ${id}`,
		amount,
		created_at: new Date(
			`2024-01-${String(id).padStart(2, "0")}T12:00:00Z`,
		).toISOString(),
	};
}

const sampleActivity: HomeActivityItem = {
	id: 1,
	description: "Coffee",
	date: "Jan 3, 2024",
	amount: "$4.50",
};

beforeEach(() => {
	mocks.navigate.mockReset();
	mocks.useUser.mockReset();
	mocks.useUser.mockReturnValue({ name: "Taylor Smith" });
	mocks.requireSession.mockReset().mockResolvedValue(undefined);
	mocks.axiosGet.mockReset();
});

describe("home page", () => {
	it("shows the account overview, aggregate totals, and five newest transactions", () => {
		const transactions = Array.from({ length: 6 }, (_, index) =>
			makeTransaction(index + 1),
		);
		render(<HomePage loaderData={{ transactions }} />);

		expect(
			screen.getByRole("heading", { name: "Welcome back, Taylor." }),
		).not.toBeNull();
		expect(screen.getByText(currencyFormatter.format(21))).not.toBeNull();
		expect(screen.getByText("Transactions recorded")).not.toBeNull();
		expect(screen.getByText("6")).not.toBeNull();
		const newestTransaction = screen.getByText("Transaction 6");
		const oldestVisibleTransaction = screen.getByText("Transaction 2");
		expect(
			newestTransaction.compareDocumentPosition(oldestVisibleTransaction) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).not.toBe(0);
		expect(screen.queryByText("Transaction 1")).toBeNull();
	});

	it("uses a fallback greeting and empty activity when no transactions are available", () => {
		mocks.useUser.mockReturnValue({});
		render(<HomePage loaderData={{ transactions: [] }} />);

		expect(
			screen.getByRole("heading", { name: "Welcome back, there." }),
		).not.toBeNull();
		expect(screen.getByText("Your activity starts here")).not.toBeNull();
		expect(screen.getByText(currencyFormatter.format(0))).not.toBeNull();
	});

	it("requires a session before loading transactions", async () => {
		const transactions = [makeTransaction(1)];
		mocks.axiosGet.mockResolvedValue({ data: transactions });

		const result = await loader({
			request: new Request("http://localhost/home"),
		} as Parameters<typeof loader>[0]);

		expect(mocks.requireSession).toHaveBeenCalledOnce();
		expect(mocks.axiosGet).toHaveBeenCalledWith("/transactions");
		expect(result).toEqual({ transactions });
	});
});

describe("home components", () => {
	it("renders a personalized welcome and forwards the add action", async () => {
		const user = userEvent.setup();
		const onAddTransaction = vi.fn();
		render(
			<WelcomePanel firstName="Taylor" onAddTransaction={onAddTransaction} />,
		);

		expect(
			screen.getByRole("heading", { name: "Welcome back, Taylor." }),
		).not.toBeNull();
		await user.click(screen.getByRole("button", { name: "Add a transaction" }));
		expect(onAddTransaction).toHaveBeenCalledOnce();
	});

	it("renders the total amount card", () => {
		render(<TotalAmountCard totalAmount="$42.75" />);

		expect(screen.getByText("Total amount tracked")).not.toBeNull();
		expect(screen.getByText("$42.75")).not.toBeNull();
	});

	it("renders the recorded transaction count card", () => {
		render(<TransactionCountCard transactionCount={12} />);

		expect(screen.getByText("Transactions recorded")).not.toBeNull();
		expect(screen.getByText("12")).not.toBeNull();
	});

	it("renders an activity row with its description, date, and amount", () => {
		render(<ActivityRow transaction={sampleActivity} />);

		expect(screen.getByText("Coffee")).not.toBeNull();
		expect(screen.getByText("Jan 3, 2024")).not.toBeNull();
		expect(screen.getByText("$4.50")).not.toBeNull();
	});

	it("renders the empty activity state and forwards the add action", async () => {
		const user = userEvent.setup();
		const onAddTransaction = vi.fn();
		render(<EmptyActivity onAddTransaction={onAddTransaction} />);

		expect(screen.getByText("Your activity starts here")).not.toBeNull();
		await user.click(screen.getByRole("button", { name: "Add a transaction" }));
		expect(onAddTransaction).toHaveBeenCalledOnce();
	});

	it("renders recent transactions and forwards the view-all action", async () => {
		const user = userEvent.setup();
		const onViewAll = vi.fn();
		render(
			<RecentActivityPanel
				transactions={[sampleActivity]}
				onViewAll={onViewAll}
				onAddTransaction={vi.fn()}
			/>,
		);

		expect(screen.getByText("Recent activity")).not.toBeNull();
		expect(screen.getByText("Coffee")).not.toBeNull();
		await user.click(screen.getByRole("button", { name: "View all" }));
		expect(onViewAll).toHaveBeenCalledOnce();
	});

	it("renders an empty state when recent activity has no entries", () => {
		render(
			<RecentActivityPanel
				transactions={[]}
				onViewAll={vi.fn()}
				onAddTransaction={vi.fn()}
			/>,
		);

		expect(screen.getByText("Your activity starts here")).not.toBeNull();
	});

	it("renders quick links and invokes the matching navigation callbacks", async () => {
		const user = userEvent.setup();
		const onTransactions = vi.fn();
		const onProfile = vi.fn();
		render(
			<QuickLinkPanel onTransactions={onTransactions} onProfile={onProfile} />,
		);

		expect(screen.getByText("Quick links")).not.toBeNull();
		await user.click(screen.getByRole("button", { name: /Transactions/ }));
		await user.click(screen.getByRole("button", { name: /Your profile/ }));
		expect(onTransactions).toHaveBeenCalledOnce();
		expect(onProfile).toHaveBeenCalledOnce();
	});
});
