import { TokenError } from "@auth0/auth0-react-router/errors";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthLayoutContent, loader } from "~/features/auth/layout";
import { render, screen } from "~/test/test-utils";

const mocks = vi.hoisted(() => {
	class MockTokenError extends Error {}

	return {
		TokenError: MockTokenError,
		getAccessToken: vi.fn(),
		rootAuthLoader: vi.fn(),
		axiosDefaults: {
			baseURL: undefined as string | undefined,
			headers: { common: {} as Record<string, string> },
		},
	};
});

vi.mock("@auth0/auth0-react-router", async () => {
	const { createElement } = await import("react");

	return {
		Auth0Provider: ({ children }: { children?: ReactNode }) =>
			createElement("div", { "data-auth-provider": true }, children),
	};
});

vi.mock("@auth0/auth0-react-router/server", () => ({
	getAccessToken: mocks.getAccessToken,
	rootAuthLoader: mocks.rootAuthLoader,
}));

vi.mock("@auth0/auth0-react-router/errors", () => ({
	TokenError: mocks.TokenError,
}));

vi.mock("axios", () => ({
	default: { defaults: mocks.axiosDefaults },
}));

vi.mock("react-router", async (importOriginal) => {
	const { createElement } = await import("react");
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		Outlet: () => createElement("span", { "data-auth-outlet": true }),
	};
});

function makeRouteArgs() {
	return {
		request: new Request("http://localhost/auth/callback"),
	} as Parameters<typeof loader>[0];
}

beforeEach(() => {
	mocks.getAccessToken.mockReset();
	mocks.rootAuthLoader.mockReset();
	mocks.axiosDefaults.baseURL = undefined;
	mocks.axiosDefaults.headers.common = {};
});

describe("authenticated layout", () => {
	it("sets the API base URL and bearer token before calling the root auth loader", async () => {
		const request = makeRouteArgs().request;
		const authResult = new Response(null, { status: 204 });
		mocks.getAccessToken.mockResolvedValue("access-token");
		mocks.rootAuthLoader.mockResolvedValue(authResult);

		await expect(
			loader({ request } as Parameters<typeof loader>[0]),
		).resolves.toBe(authResult);

		expect(mocks.axiosDefaults.baseURL).toBe(import.meta.env.VITE_API_URL);
		expect(mocks.axiosDefaults.headers.common.Authorization).toBe(
			"Bearer access-token",
		);
		expect(mocks.rootAuthLoader).toHaveBeenCalledWith(request);
	});

	it("redirects to the auth login endpoint when the access token is expired", async () => {
		mocks.getAccessToken.mockRejectedValue(new TokenError("Token expired"));

		const response = await loader(makeRouteArgs());

		if (!(response instanceof Response)) {
			throw new Error("Expected token failures to return a redirect response.");
		}
		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe("/auth/login");
		expect(mocks.rootAuthLoader).not.toHaveBeenCalled();
	});

	it("propagates unexpected token errors", async () => {
		mocks.getAccessToken.mockRejectedValue(
			new Error("Auth configuration failed"),
		);

		await expect(loader(makeRouteArgs())).rejects.toThrow(
			"Auth configuration failed",
		);
		expect(mocks.rootAuthLoader).not.toHaveBeenCalled();
	});

	it("wraps the nested route in the Auth0 provider", () => {
		render(<AuthLayoutContent />);

		const provider = document.querySelector("[data-auth-provider]");
		expect(provider).not.toBeNull();
		expect(
			provider?.contains(
				screen.getByText(
					(_content, element) =>
						element?.hasAttribute("data-auth-outlet") ?? false,
				),
			),
		).toBe(true);
	});
});
