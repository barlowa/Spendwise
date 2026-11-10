import {
	getAccessToken,
	requireSession,
} from "@auth0/auth0-react-router/server";
import axios from "axios";
import { Form, useNavigation } from "react-router";
import type { Route } from "./+types/transactions";

type Transaction = {
	id: number;
	user_id: number;
	description: string;
	amount: string | number;
	created_at: string;
};

type ActionData = {
	error?: string;
};

const getApiConfig = async (request: Request) => {
	const token = await getAccessToken(request);

	return {
		baseURL: import.meta.env.VITE_API_URL,
		headers: { Authorization: `Bearer ${token}` },
	};
};

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

	const response = await axios.get<Transaction[]>(
		"/transactions",
		await getApiConfig(request),
	);

	return { transactions: response.data };
};

export const action = async ({ request }: Route.ActionArgs) => {
	await requireSession(request);

	const formData = await request.formData();
	const intent = getFormText(formData, "_intent");
	const config = await getApiConfig(request);

	console.log("intent", intent);
	try {
		if (intent === "create" || intent === "update") {
			const description = getFormText(formData, "description");
			const amount = Number(getFormText(formData, "amount"));

			if (!description || description.length > 255) {
				return { error: "Enter a description between 1 and 255 characters." };
			}

			if (!Number.isFinite(amount) || amount <= 0) {
				return { error: "Enter an amount greater than zero." };
			}

			const body = { description, amount };

			if (intent === "create") {
				await axios.post("/transactions", body, config);
			} else {
				const transactionId = Number(getFormText(formData, "transaction_id"));

				if (!Number.isInteger(transactionId) || transactionId < 0) {
					return { error: "Invalid transaction ID." };
				}

				await axios.patch("/transactions", body, {
					...config,
					params: { transaction_id: transactionId },
				});
			}

			return { success: true };
		}

		if (intent === "delete") {
			const transactionId = Number(getFormText(formData, "transaction_id"));

			if (!Number.isInteger(transactionId) || transactionId < 0) {
				return { error: "Invalid transaction ID." };
			}

			await axios.delete("/transactions", {
				...config,
				params: { transaction_id: transactionId },
			});

			return { success: true };
		}

		return { error: "Unsupported transaction action." };
	} catch (error) {
		return { error: getApiError(error) };
	}
};

export default function Transactions({
	loaderData,
	actionData,
}: Route.ComponentProps & { actionData?: ActionData }) {
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";
	const transactions = loaderData.transactions;

	return (
		<main className="mx-auto max-w-6xl space-y-8 p-6">
			<h1 className="text-3xl font-semibold">Transactions</h1>

			<section
				aria-labelledby="create-transaction-heading"
				className="space-y-4"
			>
				<h2 id="create-transaction-heading" className="text-xl font-medium">
					Add a transaction
				</h2>
				<Form method="post" className="flex flex-wrap items-end gap-4">
					<input type="hidden" name="_intent" value="create" />
					<label className="flex flex-col gap-1">
						Description
						<input
							className="rounded border px-3 py-2"
							type="text"
							name="description"
							maxLength={255}
							required
						/>
					</label>
					<label className="flex flex-col gap-1">
						Amount
						<input
							className="rounded border px-3 py-2"
							type="number"
							name="amount"
							min="0.01"
							step="0.01"
							required
						/>
					</label>
					<button
						className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
						type="submit"
						disabled={isSubmitting}
					>
						Add transaction
					</button>
				</Form>
			</section>

			{actionData?.error && (
				<p className="text-red-700" role="alert">
					{actionData.error}
				</p>
			)}

			<section aria-labelledby="transactions-heading" className="space-y-4">
				<h2 id="transactions-heading" className="text-xl font-medium">
					Your transactions
				</h2>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left">
						<thead>
							<tr className="border-b">
								<th className="p-3" scope="col">
									Description
								</th>
								<th className="p-3" scope="col">
									Amount
								</th>
								<th className="p-3" scope="col">
									Created
								</th>
								<th className="p-3" scope="col">
									Actions
								</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction) => (
								<tr className="border-b align-top" key={transaction.id}>
									<td className="p-3">
										<input
											className="min-w-40 rounded border px-2 py-1"
											type="text"
											name="description"
											form={`update-${transaction.id}`}
											aria-label={`Description for transaction ${transaction.id}`}
											maxLength={255}
											defaultValue={transaction.description}
											required
										/>
									</td>
									<td className="p-3">
										<input
											className="w-32 rounded border px-2 py-1"
											type="number"
											name="amount"
											form={`update-${transaction.id}`}
											aria-label={`Amount for transaction ${transaction.id}`}
											min="0.01"
											step="0.01"
											defaultValue={transaction.amount}
											required
										/>
									</td>
									<td className="whitespace-nowrap p-3">
										{new Date(transaction.created_at).toLocaleString()}
									</td>
									<td className="p-3">
										<Form
											id={`update-${transaction.id}`}
											method="post"
											className="inline"
										>
											<input type="hidden" name="_intent" value="update" />
											<input
												type="hidden"
												name="transaction_id"
												value={transaction.id}
											/>
											<button
												className="mr-2 rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
												type="submit"
												disabled={isSubmitting}
											>
												Save
											</button>
										</Form>
										<Form method="post" className="inline">
											<input type="hidden" name="_intent" value="delete" />
											<input
												type="hidden"
												name="transaction_id"
												value={transaction.id}
											/>
											<button
												className="rounded bg-red-700 px-3 py-1 text-white disabled:opacity-50"
												type="submit"
												disabled={isSubmitting}
											>
												Delete
											</button>
										</Form>
									</td>
								</tr>
							))}
							{transactions.length === 0 && (
								<tr>
									<td className="p-3" colSpan={4}>
										No transactions yet.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>
		</main>
	);
}
