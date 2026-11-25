import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedBurgerMenu } from "~/components/branding/AuthenticatedBurgerMenu";
import MainHeader from "~/components/branding/MainHeader";
import { UnauthenticatedBurgerMenu } from "~/components/branding/UnauthenticatedBurgerMenu";
import { render, screen } from "~/test/test-utils";

const mocks = vi.hoisted(() => ({
	useAuth0: vi.fn(),
	logout: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router", () => ({
	useAuth0: mocks.useAuth0,
}));

beforeEach(() => {
	mocks.logout.mockReset();
	mocks.useAuth0.mockReset().mockReturnValue({
		isAuthenticated: false,
		isLoading: false,
		user: { email: "jordan@example.com" },
		logout: mocks.logout,
	});
});

describe("main header", () => {
	it("shows a loading indicator before the authentication state is known", () => {
		mocks.useAuth0.mockReturnValue({
			isAuthenticated: false,
			isLoading: true,
			user: undefined,
			logout: mocks.logout,
		});

		render(<MainHeader />);

		expect(screen.getByRole("status")).not.toBeNull();
		expect(screen.queryByRole("button", { name: "Menu" })).toBeNull();
	});

	it("shows the account name and authenticated navigation", async () => {
		const user = userEvent.setup();
		mocks.useAuth0.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			user: { name: "Jordan Doe" },
			logout: mocks.logout,
		});

		render(<MainHeader />);

		expect(screen.getByText("Jordan Doe")).not.toBeNull();
		await user.click(screen.getByRole("button", { name: "Menu" }));
		expect(
			await screen.findByRole("menuitem", { name: /Home/ }),
		).not.toBeNull();
	});

	it("uses the email when an authenticated user has no name", () => {
		mocks.useAuth0.mockReturnValue({
			isAuthenticated: true,
			isLoading: false,
			user: { email: "jordan@example.com" },
			logout: mocks.logout,
		});

		render(<MainHeader />);

		expect(screen.getByText("jordan@example.com")).not.toBeNull();
	});

	it("shows unauthenticated navigation without exposing account details", async () => {
		const user = userEvent.setup();
		render(<MainHeader />);

		expect(screen.queryByText("jordan@example.com")).toBeNull();
		await user.click(screen.getByRole("button", { name: "Menu" }));
		expect(
			await screen.findByRole("menuitem", { name: /Sign Up/ }),
		).not.toBeNull();
	});
});

describe("authenticated navigation menu", () => {
	it("links to home, profile, and transactions", async () => {
		const user = userEvent.setup();
		render(<AuthenticatedBurgerMenu />);

		await user.click(screen.getByRole("button", { name: "Menu" }));
		const homeItem = await screen.findByRole("menuitem", { name: /Home/ });
		const profileItem = screen.getByRole("menuitem", { name: /User Profile/ });
		const transactionsItem = screen.getByRole("menuitem", {
			name: /Transactions/,
		});
		expect(homeItem.getAttribute("href")).toBe("/home");
		expect(profileItem.getAttribute("href")).toBe("/profile");
		expect(transactionsItem.getAttribute("href")).toBe("/transactions");
	});

	it("logs out and returns the user to the public root page", async () => {
		const user = userEvent.setup();
		render(<AuthenticatedBurgerMenu />);

		await user.click(screen.getByRole("button", { name: "Menu" }));
		await user.click(await screen.findByRole("menuitem", { name: /Signout/ }));
		expect(mocks.logout).toHaveBeenCalledWith({ returnTo: "/" });
	});
});

describe("unauthenticated navigation menu", () => {
	it("offers sign-up and sign-in links to the login page", async () => {
		const user = userEvent.setup();
		render(<UnauthenticatedBurgerMenu />);

		await user.click(screen.getByRole("button", { name: "Menu" }));
		const signup = await screen.findByRole("menuitem", { name: /Sign Up/ });
		const signin = screen.getByRole("menuitem", { name: /Sign in/ });

		expect(signup.getAttribute("href")).toBe("/login");
		expect(signin.getAttribute("href")).toBe("/login");
	});
});
