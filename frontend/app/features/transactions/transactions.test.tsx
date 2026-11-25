import {
	createElement,
	type FormHTMLAttributes,
	isValidElement,
	type ReactElement,
	type ReactNode,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CreateTransactionForm from "~/features/transactions/components/CreateTransactionForm";
import OverviewHeader from "~/features/transactions/components/OverviewHeader";
import TransactionsTable from "~/features/transactions/components/TransactionsTable";
import {
	action,
	loader,
	TransactionsPage,
} from "~/features/transactions/index";
import type { Transaction } from "~/features/transactions/types";
import { currencyFormatter } from "~/utils/convert";

const mocks = vi.hoisted(() => ({
	requireSession: vi.fn(),
	get: vi.fn(),
	post: vi.fn(),
	patch: vi.fn(),
	delete: vi.fn(),
	isAxiosError: vi.fn(),
	navigation: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router/server", () => ({
	requireSession: mocks.requireSession,
}));

vi.mock("axios", () => ({
	default: {
		get: mocks.get,
		post: mocks.post,
		patch: mocks.patch,
		delete: mocks.delete,
		isAxiosError: mocks.isAxiosError,
	},
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useNavigation: () => mocks.navigation(),
		Form: ({ children, ...props }: FormHTMLAttributes<HTMLFormElement>) =>
			createElement("form", props, children),
	};
});

type ElementProps = {
	children?: ReactNode;
	disabled?: boolean;
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

function makeTransaction(
	id: number,
	description = `Transaction ${id}`,
	amount = "12.50",
): Transaction {
	return {
		id,
		user_id: 1,
		description,
		amount,
		created_at: "2024-01-03T12:00:00Z",
	};
}

function makeRequest(fields: Record<string, string>) {
	return new Request("http://localhost/transactions", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams(fields),
	});
}

async function submitAction(fields: Record<string, string>) {
	return action({
		request: makeRequest(fields),
	} as Parameters<typeof action>[0]);
}

beforeEach(() => {
	mocks.requireSession.mockReset().mockResolvedValue(undefined);
	mocks.get.mockReset();
	mocks.post.mockReset().mockResolvedValue({});
	mocks.patch.mockReset().mockResolvedValue({});
	mocks.delete.mockReset().mockResolvedValue({});
	mocks.isAxiosError
		.mockReset()
		.mockImplementation(
			(error) =>
				typeof error === "object" && error !== null && "isAxiosError" in error,
		);
	mocks.navigation.mockReset().mockReturnValue({ state: "idle" });
});

describe("transactions route loader", () => {
	it("requires an authenticated session and returns the transactions", async () => {
		const transactions = [makeTransaction(1)];
		mocks.get.mockResolvedValue({ data: transactions });

		const result = await loader({
			request: new Request("http://localhost/transactions"),
		} as Parameters<typeof loader>[0]);

		expect(mocks.requireSession).toHaveBeenCalledOnce();
		expect(mocks.get).toHaveBeenCalledWith("/transactions");
		expect(result).toEqual({ transactions });
	});

	it("does not fetch transactions when session validation fails", async () => {
		mocks.requireSession.mockRejectedValue(new Error("Unauthenticated"));

		await expect(
			loader({
				request: new Request("http://localhost/transactions"),
			} as Parameters<typeof loader>[0]),
		).rejects.toThrow("Unauthenticated");
		expect(mocks.get).not.toHaveBeenCalled();
	});
});

describe("transactions route action", () => {
	it("creates a transaction after trimming the description and parsing the amount", async () => {
		const result = await submitAction({
			_intent: "create",
			description: "  Coffee  ",
			amount: "12.50",
		});

		expect(mocks.requireSession).toHaveBeenCalledOnce();
		expect(mocks.post).toHaveBeenCalledWith("/transactions", {
			description: "Coffee",
			amount: 12.5,
		});
		expect(result).toEqual({ success: true, error: "" });
	});

	it.each(["", "   ", "a".repeat(256)])(
		"rejects an empty or overlong description (%j)",
		async (description) => {
			const result = await submitAction({
				_intent: "create",
				description,
				amount: "5",
			});

			expect(result).toEqual({
				success: false,
				error: "Enter a description between 1 and 255 characters.",
			});
			expect(mocks.post).not.toHaveBeenCalled();
		},
	);

	it.each(["", "0", "-1", "not-a-number", "Infinity"])(
		"rejects an invalid transaction amount (%j)",
		async (amount) => {
			const result = await submitAction({
				_intent: "create",
				description: "Coffee",
				amount,
			});

			expect(result).toEqual({
				success: false,
				error: "Enter an amount greater than zero.",
			});
			expect(mocks.post).not.toHaveBeenCalled();
		},
	);

	it("updates a transaction with the ID in query parameters", async () => {
		const result = await submitAction({
			_intent: "update",
			transaction_id: "17",
			description: "Updated coffee",
			amount: "6.25",
		});

		expect(mocks.patch).toHaveBeenCalledWith(
			"/transactions",
			{ description: "Updated coffee", amount: 6.25 },
			{ params: { transaction_id: 17 } },
		);
		expect(result).toEqual({ success: true, error: "" });
	});

	it.each(["", "0", "-1", "2.5", "invalid"])(
		"rejects an invalid update transaction ID (%j)",
		async (transactionId) => {
			const result = await submitAction({
				_intent: "update",
				transaction_id: transactionId,
				description: "Coffee",
				amount: "5",
			});

			expect(result).toEqual({
				success: false,
				error: "Invalid transaction ID.",
			});
			expect(mocks.patch).not.toHaveBeenCalled();
		},
	);

	it("deletes a transaction using its ID in query parameters", async () => {
		const result = await submitAction({
			_intent: "delete",
			transaction_id: "17",
		});

		expect(mocks.delete).toHaveBeenCalledWith("/transactions", {
			params: { transaction_id: 17 },
		});
		expect(result).toEqual({ success: true, error: "" });
	});

	it.each(["", "0", "1.5"])(
		"rejects a delete request with an invalid transaction ID (%j)",
		async (transactionId) => {
			const result = await submitAction({
				_intent: "delete",
				transaction_id: transactionId,
			});

			expect(result).toEqual({
				success: false,
				error: "Invalid transaction ID.",
			});
			expect(mocks.delete).not.toHaveBeenCalled();
		},
	);

	it("rejects unsupported actions", async () => {
		const result = await submitAction({ _intent: "unknown" });

		expect(result).toEqual({
			success: false,
			error: "Unsupported transaction action.",
		});
	});

	it("returns an API-provided error detail", async () => {
		mocks.post.mockRejectedValue({
			isAxiosError: true,
			message: "Request failed",
			response: { data: { detail: "Description is already in use." } },
		});

		const result = await submitAction({
			_intent: "create",
			description: "Coffee",
			amount: "5",
		});

		expect(result).toEqual({
			success: false,
			error: "Description is already in use.",
		});
	});

	it("returns the request message when the API has no string detail", async () => {
		mocks.post.mockRejectedValue({
			isAxiosError: true,
			message: "Request failed",
			response: { data: { detail: ["invalid"] } },
		});

		const result = await submitAction({
			_intent: "create",
			description: "Coffee",
			amount: "5",
		});

		expect(result).toEqual({
			success: false,
			error: "Request failed",
		});
	});

	it("rethrows non-Axios errors instead of hiding them", async () => {
		mocks.post.mockRejectedValue(new Error("Unexpected failure"));

		await expect(
			submitAction({
				_intent: "create",
				description: "Coffee",
				amount: "5",
			}),
		).rejects.toThrow("Unexpected failure");
	});
});

describe("transactions page", () => {
	it("renders the summary, create form, and populated transaction table", () => {
		const markup = render(
			TransactionsPage({
				loaderData: {
					transactions: [
						makeTransaction(1, "Groceries", "10.25"),
						makeTransaction(2, "Coffee", "6.25"),
					],
				},
				actionData: undefined,
			}),
		);

		expect(markup).toContain("Transactions");
		expect(markup).toContain(currencyFormatter.format(16.5));
		expect(markup).toContain("Add a transaction");
		expect(markup).toContain("Recent activity");
		expect(markup).toContain("2 transactions");
		expect(markup).toContain("Groceries");
		expect(markup).toContain("Coffee");
	});

	it("shows action errors accessibly", () => {
		const markup = render(
			TransactionsPage({
				loaderData: { transactions: [] },
				actionData: {
					success: false,
					error: "Enter an amount greater than zero.",
				},
			}),
		);

		expect(markup).toContain('role="alert"');
		expect(markup).toContain("Enter an amount greater than zero.");
	});

	it("disables transaction controls while submitting", () => {
		mocks.navigation.mockReturnValue({ state: "submitting" });
		const markup = render(
			TransactionsPage({
				loaderData: { transactions: [makeTransaction(1)] },
				actionData: undefined,
			}),
		);

		expect(markup).toContain("disabled");
	});

	it("renders an empty table state when no transactions exist", () => {
		const markup = render(
			TransactionsPage({
				loaderData: { transactions: [] },
				actionData: undefined,
			}),
		);

		expect(markup).toContain("No transactions yet");
		expect(markup).toContain("0 transactions");
	});
});

describe("transactions page components", () => {
	it("shows the amount total in the overview header", () => {
		const markup = render(
			OverviewHeader({
				transactions: [
					makeTransaction(1, "Groceries", "10.25"),
					makeTransaction(2, "Coffee", "6.25"),
				],
			}),
		);

		expect(markup).toContain("Total transactions");
		expect(markup).toContain(currencyFormatter.format(16.5));
	});

	it("renders the create form with the expected fields and submit action", () => {
		const markup = render(CreateTransactionForm({ isSubmitting: false }));

		expect(markup).toContain('name="_intent" value="create"');
		expect(markup).toContain("Description");
		expect(markup).toContain("Amount");
		expect(markup).toContain("Add transaction");
	});

	it("renders an empty state in the transaction table", () => {
		const markup = render(
			TransactionsTable({ transactions: [], isSubmitting: false }),
		);

		expect(markup).toContain("No transactions yet");
		expect(markup).toContain("Add your first transaction above.");
	});
});
