import { requireSession } from "@auth0/auth0-react-router/server";
import axios from "axios";
import { useNavigation } from "react-router";
import CreateTransactionForm from "~/routes/transactions/components/CreateTransactionForm";
import OverviewHeader from "~/routes/transactions/components/OverviewHeader";
import TransactionsTable from "~/routes/transactions/components/TransactionsTable";
import type {
	CreateTransactionRequest,
	CreateTransactionResponse,
	DeleteTransactionRequest,
	DeleteTransactionResponse,
	GetTransactionsResponse,
	UpdateTransactionRequest,
	UpdateTransactionResponse,
} from "~/routes/transactions/types";
import type { Route } from "./+types";

const getFormText = (formData: FormData, key: string) => {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim() : "";
};

const getApiError = (error: unknown) => {
	if (axios.isAxiosError(error)) {
		const detail = error.response?.data?.detail;
		return typeof detail === "string" ? detail : error.message;
	}

	throw error;
};

export const loader = async ({ request }: Route.LoaderArgs) => {
	await requireSession(request);

	const response = await axios.get<GetTransactionsResponse>("/transactions");

	return { transactions: response.data };
};

export const action = async ({ request }: Route.ActionArgs) => {
	await requireSession(request);

	const formData = await request.formData();
	const intent = getFormText(formData, "_intent");

	try {
		if (intent === "create" || intent === "update") {
			const description = getFormText(formData, "description");
			const amount = Number(getFormText(formData, "amount"));

			if (!description || description.length > 255) {
				return {
					success: false,
					error: "Enter a description between 1 and 255 characters.",
				};
			}

			if (!Number.isFinite(amount) || amount <= 0) {
				return { success: false, error: "Enter an amount greater than zero." };
			}

			const body = { description, amount };

			if (intent === "create") {
				await axios.post<CreateTransactionResponse, CreateTransactionRequest>(
					"/transactions",
					body,
				);
			} else {
				const transactionId = Number(getFormText(formData, "transaction_id"));

				if (!Number.isInteger(transactionId) || transactionId < 0) {
					return { success: false, error: "Invalid transaction ID." };
				}

				await axios.patch<UpdateTransactionResponse, UpdateTransactionRequest>(
					"/transactions",
					body,
					{
						params: { transaction_id: transactionId },
					},
				);
			}

			return { success: true, error: "" };
		}

		if (intent === "delete") {
			const transactionId = Number(getFormText(formData, "transaction_id"));

			if (!Number.isInteger(transactionId) || transactionId < 0) {
				return { success: false, error: "Invalid transaction ID." };
			}

			await axios.delete<DeleteTransactionResponse, DeleteTransactionRequest>(
				"/transactions",
				{
					params: { transaction_id: transactionId },
				},
			);

			return { success: true, error: "" };
		}

		return { success: false, error: "Unsupported transaction action." };
	} catch (error) {
		return { success: false, error: getApiError(error) };
	}
};

export default function Transactions({
	loaderData,
	actionData,
}: Route.ComponentProps) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const transactions = loaderData.transactions ?? [];

	return (
		<main className="mx-auto min-h-[calc(100vh-65px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<OverviewHeader transactions={transactions} />

			<CreateTransactionForm isSubmitting={isSubmitting} />

			{actionData?.error && (
				<div
					className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
					role="alert"
				>
					{actionData.error}
				</div>
			)}

			<TransactionsTable
				transactions={transactions}
				isSubmitting={isSubmitting}
			/>
		</main>
	);
}
