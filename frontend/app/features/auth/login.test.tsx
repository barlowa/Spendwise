import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "~/features/auth/login";
import { render, screen, userEvent } from "~/test/test-utils";

const mocks = vi.hoisted(() => ({
	useAuth0: vi.fn(),
	loginWithRedirect: vi.fn(),
	logout: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router", () => ({
	useAuth0: mocks.useAuth0,
}));

beforeEach(() => {
	mocks.loginWithRedirect.mockReset();
	mocks.logout.mockReset();
	mocks.useAuth0.mockReset().mockReturnValue({
		loginWithRedirect: mocks.loginWithRedirect,
		logout: mocks.logout,
		isAuthenticated: false,
		isLoading: false,
	});
});

describe("login page", () => {
	it("shows a loading status while checking authentication", () => {
		mocks.useAuth0.mockReturnValue({
			loginWithRedirect: mocks.loginWithRedirect,
			logout: mocks.logout,
			isAuthenticated: false,
			isLoading: true,
		});

		render(<LoginPage />);

		expect(screen.getByText("Checking your sign-in status...")).not.toBeNull();
		expect(
			screen.queryByRole("button", { name: "Log in with Auth0" }),
		).toBeNull();
	});

	it("offers login and signup and returns both flows to the home dashboard", async () => {
		const user = userEvent.setup();
		render(<LoginPage />);

		expect(
			screen.getByText("Sign in to continue to your account."),
		).not.toBeNull();
		const loginButton = screen.getByRole("button", {
			name: "Log in with Auth0",
		});
		const signupButton = screen.getByRole("button", {
			name: "Create an account",
		});
		await user.click(loginButton);
		await user.click(signupButton);
		expect(mocks.loginWithRedirect).toHaveBeenNthCalledWith(1, {
			returnTo: "/home",
		});
		expect(mocks.loginWithRedirect).toHaveBeenNthCalledWith(2, {
			returnTo: "/home",
		});
	});

	it("shows the signed-in user and signs out when requested", async () => {
		const user = userEvent.setup();
		mocks.useAuth0.mockReturnValue({
			loginWithRedirect: mocks.loginWithRedirect,
			logout: mocks.logout,
			isAuthenticated: true,
			isLoading: false,
			user: { name: "Jordan Doe", email: "jordan@example.com" },
		});

		render(<LoginPage />);

		expect(screen.getByText("Signed in as")).not.toBeNull();
		expect(screen.getByText("Jordan Doe")).not.toBeNull();
		await user.click(screen.getByRole("button", { name: "Sign out" }));
		expect(mocks.logout).toHaveBeenCalledOnce();
	});

	it("uses the email when the signed-in user has no name", () => {
		mocks.useAuth0.mockReturnValue({
			loginWithRedirect: mocks.loginWithRedirect,
			logout: mocks.logout,
			isAuthenticated: true,
			isLoading: false,
			user: { email: "jordan@example.com" },
		});

		render(<LoginPage />);

		expect(screen.getByText("jordan@example.com")).not.toBeNull();
	});
});
