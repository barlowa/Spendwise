import { Button, Card, Form, Input } from "@heroui/react";
import { HiOutlineBanknotes } from "react-icons/hi2";

interface Props {
	isSubmitting: boolean;
}

export default function CreateTransactionForm({ isSubmitting }: Props) {
	return (
		<Card className="mb-6 border border-border bg-surface shadow-[0_18px_50px_-32px_rgba(16,185,129,0.55)]">
			<Card.Header className="pb-2">
				<Card.Title>Add a transaction</Card.Title>
				<Card.Description>
					Create a new entry for your spending.
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<Form
					method="post"
					className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto] md:items-end"
				>
					<input type="hidden" name="_intent" value="create" />
					<div>
						<label
							htmlFor="create-description"
							className="mb-2 block text-sm font-medium"
						>
							Description
						</label>
						<Input
							id="create-description"
							name="description"
							fullWidth
							maxLength={255}
							required
							placeholder="e.g. Grocery shopping"
						/>
					</div>
					<div>
						<label
							htmlFor="create-amount"
							className="mb-2 block text-sm font-medium"
						>
							Amount
						</label>
						<Input
							id="create-amount"
							name="amount"
							type="number"
							fullWidth
							min="0.01"
							step="0.01"
							required
							placeholder="0.00"
						/>
					</div>
					<Button
						type="submit"
						variant="primary"
						size="lg"
						isDisabled={isSubmitting}
						className="min-w-40"
					>
						<HiOutlineBanknotes className="size-4" />
						Add transaction
					</Button>
				</Form>
			</Card.Content>
		</Card>
	);
}
