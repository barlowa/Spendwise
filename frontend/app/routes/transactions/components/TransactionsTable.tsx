import { Button, Card, Chip, Input, Table } from "@heroui/react";
import {
	HiArrowPath,
	HiOutlineCalendarDays,
	HiOutlinePencilSquare,
	HiOutlineTrash,
} from "react-icons/hi2";
import { Form } from "react-router";
import type { Transaction } from "~/routes/transactions/types";

interface Props {
	transactions: Transaction[];
	isSubmitting: boolean;
}

export default function TransactionsTable({
	transactions,
	isSubmitting,
}: Props) {
	return (
		<Card className="overflow-hidden border border-border bg-surface shadow-sm">
			<Card.Header className="flex-row items-center justify-between border-b border-border pb-4">
				<div>
					<Card.Title>Recent activity</Card.Title>
					<Card.Description>
						{transactions.length}{" "}
						{transactions.length === 1 ? "transaction" : "transactions"}
					</Card.Description>
				</div>
				<Chip variant="soft" size="sm" className="tabular-nums">
					{transactions.length}
				</Chip>
			</Card.Header>
			<Card.Content className="p-0">
				<Table>
					<Table.ScrollContainer>
						<Table.Content aria-label="Transactions" className="min-w-190">
							<Table.Header>
								<Table.Column isRowHeader>Description</Table.Column>
								<Table.Column>Amount</Table.Column>
								<Table.Column>Created</Table.Column>
								<Table.Column>Actions</Table.Column>
							</Table.Header>
							<Table.Body>
								{transactions.map((transaction) => (
									<Table.Row key={transaction.id}>
										<Table.Cell>
											<Input
												type="text"
												name="description"
												form={`update-${transaction.id}`}
												aria-label={`Description for transaction ${transaction.id}`}
												maxLength={255}
												defaultValue={transaction.description}
												required
												variant="secondary"
												className="min-w-56"
											/>
										</Table.Cell>
										<Table.Cell>
											<Input
												type="number"
												name="amount"
												form={`update-${transaction.id}`}
												aria-label={`Amount for transaction ${transaction.id}`}
												min="0.01"
												step="0.01"
												defaultValue={transaction.amount}
												required
												variant="secondary"
												className="w-32"
											/>
										</Table.Cell>
										<Table.Cell>
											<div className="flex items-center gap-2 whitespace-nowrap text-sm text-muted">
												<HiOutlineCalendarDays className="size-4" />
												{new Date(transaction.created_at).toLocaleDateString(
													undefined,
													{
														month: "short",
														day: "numeric",
														year: "numeric",
													},
												)}
											</div>
										</Table.Cell>
										<Table.Cell>
											<div className="flex items-center gap-2">
												<Form id={`update-${transaction.id}`} method="post">
													<input type="hidden" name="_intent" value="update" />
													<input
														type="hidden"
														name="transaction_id"
														value={transaction.id}
													/>
												</Form>
												<Button
													type="submit"
													form={`update-${transaction.id}`}
													variant="secondary"
													size="sm"
													isDisabled={isSubmitting}
												>
													<HiOutlinePencilSquare className="size-4" />
													Save
												</Button>
												<Form method="post">
													<input type="hidden" name="_intent" value="delete" />
													<input
														type="hidden"
														name="transaction_id"
														value={transaction.id}
													/>
													<Button
														type="submit"
														variant="danger-soft"
														size="sm"
														isIconOnly
														aria-label={`Delete transaction ${transaction.id}`}
														isDisabled={isSubmitting}
													>
														<HiOutlineTrash className="size-4" />
													</Button>
												</Form>
											</div>
										</Table.Cell>
									</Table.Row>
								))}
								{transactions.length === 0 && (
									<Table.Row>
										<Table.Cell colSpan={4}>
											<div className="flex min-h-48 flex-col items-center justify-center gap-3 py-8 text-center">
												<div className="flex size-12 items-center justify-center rounded-full bg-default text-muted">
													<HiArrowPath className="size-5" />
												</div>
												<div>
													<p className="font-medium">No transactions yet</p>
													<p className="mt-1 text-sm text-muted">
														Add your first transaction above.
													</p>
												</div>
											</div>
										</Table.Cell>
									</Table.Row>
								)}
							</Table.Body>
						</Table.Content>
					</Table.ScrollContainer>
				</Table>
			</Card.Content>
		</Card>
	);
}
