import { Button } from "@heroui/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage, meta } from "~/features/auth/login";

const mocks = vi.hoisted(() => ({
	useAuth0: vi.fn(),
	loginWithRedirect: vi.fn(),
	logout: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router", () => ({
	useAuth0: mocks.useAuth0,
}));

type ElementProps = {
	children?: ReactNode;
	onPress?: () => void;
};

function findButtons(node: ReactNode): ReactElement<ElementProps>[] {
	if (Array.isArray(node)) {
		return node.flatMap(findButtons);
	}

	if (!isValidElement(node)) {
		return [];
	}

	const element = node as ReactElement<ElementProps>;
	const matches = element.type === Button ? [element] : [];
	return [...matches, ...findButtons(element.props.children)];
}

function render(node: ReactNode) {
	return renderToStaticMarkup(node);
}

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

		const markup = render(LoginPage());

		expect(markup).toContain('role="status"');
		expect(markup).toContain("Checking your sign-in status...");
		expect(markup).not.toContain("Log in with Auth0");
	});

	it("offers login and signup and returns both flows to the home dashboard", () => {
		const page = LoginPage();
		const markup = render(page);
		const buttons = findButtons(page);

		expect(markup).toContain("Sign in to continue to your account.");
		expect(markup).toContain("Log in with Auth0");
		expect(markup).toContain("Create an account");
		expect(buttons).toHaveLength(2);

		buttons[0]?.props.onPress?.();
		buttons[1]?.props.onPress?.();
		expect(mocks.loginWithRedirect).toHaveBeenNthCalledWith(1, {
			returnTo: "/home",
		});
		expect(mocks.loginWithRedirect).toHaveBeenNthCalledWith(2, {
			returnTo: "/home",
		});
	});

	it("shows the signed-in user and signs out when requested", () => {
		mocks.useAuth0.mockReturnValue({
			loginWithRedirect: mocks.loginWithRedirect,
			logout: mocks.logout,
			isAuthenticated: true,
			isLoading: false,
			user: { name: "Jordan Doe", email: "jordan@example.com" },
		});

		const page = LoginPage();
		const markup = render(page);
		const [signOutButton] = findButtons(page);

		expect(markup).toContain("Signed in as");
		expect(markup).toContain("Jordan Doe");
		signOutButton?.props.onPress?.();
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

		expect(render(LoginPage())).toContain("jordan@example.com");
	});

	it("provides login metadata", () => {
		expect(meta()).toEqual([
			{ title: "Sign in | Spendwise" },
			{ name: "description", content: "Sign in to your Spendwise account." },
		]);
	});
});
