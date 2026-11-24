import type { components, paths } from "~/types/api";

export type Transaction = components["schemas"]["TransactionResponse"];

export type GetTransactionsResponse = paths["/transactions"]["get"]["responses"]["200"]["content"]["application/json"]

export type CreateTransactionRequest = paths["/transactions"]["post"]["requestBody"]["content"]["application/json"];
export type CreateTransactionResponse = paths["/transactions"]["post"]["responses"]["201"]["content"]["application/json"];

export type UpdateTransactionRequest = paths["/transactions"]["patch"]["requestBody"]["content"]["application/json"];
export type UpdateTransactionResponse = paths["/transactions"]["patch"]["responses"]["200"]["content"]["application/json"];

export type DeleteTransactionRequest = paths["/transactions"]["delete"]["parameters"]["query"]
export type DeleteTransactionResponse = paths["/transactions"]["delete"]["responses"]["204"]["content"]

