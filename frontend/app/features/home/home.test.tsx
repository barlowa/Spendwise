import { Button } from "@heroui/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ActivityRow from "~/features/home/components/ActivityRow";
import EmptyActivity from "~/features/home/components/EmptyActivity";
import QuickLinkPanel from "~/features/home/components/QuickLinkPanel";
import RecentActivityPanel from "~/features/home/components/RecentActivityPanel";
import TotalAmountCard from "~/features/home/components/TotalAmountCard";
import TransactionCountCard from "~/features/home/components/TransactionCountCard";
import WelcomePanel from "~/features/home/components/WelcomePanel";
import { HomePage, loader, meta } from "~/features/home/index";
import type { HomeActivityItem } from "~/features/home/types";
import type { Transaction } from "~/features/transactions/types";

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

type ElementProps = {
	children?: ReactNode;
	onClick?: () => void;
	onPress?: () => void;
};

function findElements(
	node: ReactNode,
	predicate: (element: ReactElement<ElementProps>) => boolean,
): ReactElement<ElementProps>[] {
	if (Array.isArray(node)) {
		return node.flatMap((child) => findElements(child, predicate));
	}

	if (!isValidElement(node)) {
		return [];
	}

	const element = node as ReactElement<ElementProps>;
	const matches = predicate(element) ? [element] : [];
	return [...matches, ...findElements(element.props.children, predicate)];
}

function render(node: ReactNode) {
	return renderToStaticMarkup(node);
}

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
		const markup = render(HomePage({ loaderData: { transactions } }));

		expect(markup).toContain("Welcome back, Taylor.");
		expect(markup).toContain("21.00");
		expect(markup).toContain("Transactions recorded");
		expect(markup).toContain(">6<");
		expect(markup).toContain("Transaction 6");
		expect(markup).toContain("Transaction 2");
		expect(markup).not.toContain("Transaction 1");
		expect(markup.indexOf("Transaction 6")).toBeLessThan(
			markup.indexOf("Transaction 2"),
		);
	});

	it("uses a fallback greeting and empty activity when no transactions are available", () => {
		mocks.useUser.mockReturnValue({});
		const markup = render(HomePage({ loaderData: { transactions: [] } }));

		expect(markup).toContain("Welcome back, there.");
		expect(markup).toContain("Your activity starts here");
		expect(markup).toContain("0.00");
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

	it("provides home page metadata", () => {
		expect(meta()).toEqual([
			{ title: "Home | Spendwise" },
			{
				name: "description",
				content: "A quick overview of your spending and recent transactions.",
			},
		]);
	});
});

describe("home components", () => {
	it("renders a personalized welcome and forwards the add action", () => {
		const onAddTransaction = vi.fn();
		const element = WelcomePanel({
			firstName: "Taylor",
			onAddTransaction,
		});
		const markup = render(element);
		const [button] = findElements(
			element,
			(candidate) => candidate.type === Button,
		);

		expect(markup).toContain("Welcome back, Taylor.");
		expect(markup).toContain("Add a transaction");
		button?.props.onPress?.();
		expect(onAddTransaction).toHaveBeenCalledOnce();
	});

	it("renders the total amount card", () => {
		const markup = render(TotalAmountCard({ totalAmount: "$42.75" }));

		expect(markup).toContain("Total amount tracked");
		expect(markup).toContain("$42.75");
	});

	it("renders the recorded transaction count card", () => {
		const markup = render(TransactionCountCard({ transactionCount: 12 }));

		expect(markup).toContain("Transactions recorded");
		expect(markup).toContain(">12<");
	});

	it("renders an activity row with its description, date, and amount", () => {
		const markup = render(ActivityRow({ transaction: sampleActivity }));

		expect(markup).toContain("Coffee");
		expect(markup).toContain("Jan 3, 2024");
		expect(markup).toContain("$4.50");
	});

	it("renders the empty activity state and forwards the add action", () => {
		const onAddTransaction = vi.fn();
		const element = EmptyActivity({ onAddTransaction });
		const markup = render(element);
		const [button] = findElements(
			element,
			(candidate) => candidate.type === Button,
		);

		expect(markup).toContain("Your activity starts here");
		button?.props.onPress?.();
		expect(onAddTransaction).toHaveBeenCalledOnce();
	});

	it("renders recent transactions and forwards the view-all action", () => {
		const onViewAll = vi.fn();
		const element = RecentActivityPanel({
			transactions: [sampleActivity],
			onViewAll,
			onAddTransaction: vi.fn(),
		});
		const markup = render(element);
		const [viewAllButton] = findElements(
			element,
			(candidate) => candidate.type === Button,
		);

		expect(markup).toContain("Recent activity");
		expect(markup).toContain("Coffee");
		viewAllButton?.props.onPress?.();
		expect(onViewAll).toHaveBeenCalledOnce();
	});

	it("renders an empty state when recent activity has no entries", () => {
		const markup = render(
			RecentActivityPanel({
				transactions: [],
				onViewAll: vi.fn(),
				onAddTransaction: vi.fn(),
			}),
		);

		expect(markup).toContain("Your activity starts here");
	});

	it("renders quick links and invokes the matching navigation callbacks", () => {
		const onTransactions = vi.fn();
		const onProfile = vi.fn();
		const element = QuickLinkPanel({
			onTransactions,
			onProfile,
		});
		const markup = render(element);
		const buttons = findElements(
			element,
			(candidate) => candidate.type === "button",
		);

		expect(markup).toContain("Transactions");
		expect(markup).toContain("Your profile");
		buttons[0]?.props.onClick?.();
		buttons[1]?.props.onClick?.();
		expect(onTransactions).toHaveBeenCalledOnce();
		expect(onProfile).toHaveBeenCalledOnce();
	});
});
