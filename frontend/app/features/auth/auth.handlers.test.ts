import { beforeEach, describe, expect, it, vi } from "vitest";
import { action, loader } from "~/features/auth/auth.$";

const mocks = vi.hoisted(() => ({
	auth0: { config: "test-auth-config" },
	handleAuth: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router/server", () => ({
	handleAuth: mocks.handleAuth,
}));

vi.mock("~/features/auth/auth0.server", () => ({
	auth0: mocks.auth0,
}));

function makeRouteArgs(method: string) {
	return {
		request: new Request("http://localhost/auth/callback", { method }),
	} as Parameters<typeof loader>[0];
}

beforeEach(() => {
	mocks.handleAuth.mockReset();
});

describe("Auth0 route handlers", () => {
	it("delegates the auth callback loader to handleAuth", async () => {
		const request = makeRouteArgs("GET").request;
		const result = new Response(null, { status: 204 });
		mocks.handleAuth.mockResolvedValue(result);

		await expect(
			loader({ request } as Parameters<typeof loader>[0]),
		).resolves.toBe(result);
		expect(mocks.handleAuth).toHaveBeenCalledWith(mocks.auth0, request);
	});

	it("delegates auth callback actions to handleAuth", async () => {
		const request = makeRouteArgs("POST").request;
		const result = new Response(null, { status: 204 });
		mocks.handleAuth.mockResolvedValue(result);

		await expect(
			action({ request } as Parameters<typeof action>[0]),
		).resolves.toBe(result);
		expect(mocks.handleAuth).toHaveBeenCalledWith(mocks.auth0, request);
	});
});
