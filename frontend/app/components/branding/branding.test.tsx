import { Dropdown } from "@heroui/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthenticatedBurgerMenu } from "~/components/branding/AuthenticatedBurgerMenu";
import MainHeader from "~/components/branding/MainHeader";
import { UnauthenticatedBurgerMenu } from "~/components/branding/UnauthenticatedBurgerMenu";

const mocks = vi.hoisted(() => ({
	useAuth0: vi.fn(),
	logout: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router", () => ({
	useAuth0: mocks.useAuth0,
}));

type ElementProps = {
	children?: ReactNode;
	id?: string;
	href?: string;
	onPress?: () => void;
};

function findElements(
	node: ReactNode,
	predicate: (element: ReactElement<ElementProps>) => boolean,
): ReactElement<ElementProps>[] {
	if (Array.isArray(node)) {
		return node.flatMap((child) => findElements(child, predicate));
	}

	if (!isValidElement(node)) {
		return [];
	}

	const element = node as ReactElement<ElementProps>;
	const matches = predicate(element) ? [element] : [];
	return [...matches, ...findElements(element.props.children, predicate)];
}

function render(node: ReactNode) {
	return renderToStaticMarkup(node);
}

beforeEach(() => {
	mocks.logout.mockReset();
	mocks.useAuth0.mockReset().mockReturnValue({
		isAuthenticated: false,
		isLoading: false,
		user: undefined,
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

		const markup = render(MainHeader());

		expect(markup).toContain("spinner");
		expect(markup).not.toContain('aria-label="Menu"');
	});

	it("shows the account name and authenticated navigation", () => {
		const header = MainHeaderWithAuth({
			isAuthenticated: true,
			user: { name: "Jordan Doe" },
		});
		const markup = render(
			header,
		);

		expect(markup).toContain("Jordan Doe");
		expect(markup).toContain('aria-label="Menu"');
		expect(
			findElements(header, (element) => element.type === AuthenticatedBurgerMenu),
		).toHaveLength(1);
	});

	it("uses the email when an authenticated user has no name", () => {
		const markup = render(
			MainHeaderWithAuth({
				isAuthenticated: true,
				user: { email: "jordan@example.com" },
			}),
		);

		expect(markup).toContain("jordan@example.com");
	});

	it("shows unauthenticated navigation without exposing account details", () => {
		const header = MainHeader();
		const markup = render(header);

		expect(markup).toContain('aria-label="Menu"');
		expect(markup).not.toContain("jordan@example.com");
		expect(
			findElements(header, (element) => element.type === UnauthenticatedBurgerMenu),
		).toHaveLength(1);
	});
});

function MainHeaderWithAuth({
	isAuthenticated,
	user,
}: {
	isAuthenticated: boolean;
	user: { name?: string; email?: string };
}) {
	mocks.useAuth0.mockReturnValue({
		isAuthenticated,
		isLoading: false,
		user,
		logout: mocks.logout,
	});
	return MainHeader();
}

describe("authenticated navigation menu", () => {
	it("links to home, profile, and transactions", () => {
		const menu = AuthenticatedBurgerMenu();
		const items = findElements(
			menu,
			(element) => element.type === Dropdown.Item,
		);

		expect(items.map((item) => item.props.href)).toEqual([
			"/home",
			"/profile",
			"/transactions",
			undefined,
		]);
		expect(items.map((item) => item.props.id)).toEqual([
			"home",
			"update-profile",
			"transactions",
			"signout",
		]);
	});

	it("logs out and returns the user to the public root page", () => {
		const menu = AuthenticatedBurgerMenu();
		const [signOutItem] = findElements(
			menu,
			(element) => element.props.id === "signout",
		);

		signOutItem?.props.onPress?.();
		expect(mocks.logout).toHaveBeenCalledWith({ returnTo: "/" });
	});
});

describe("unauthenticated navigation menu", () => {
	it("offers sign-up and sign-in links to the login page", () => {
		const menu = UnauthenticatedBurgerMenu();
		const items = findElements(
			menu,
			(element) => element.type === Dropdown.Item,
		);

		expect(items.map((item) => item.props.href)).toEqual([
			"/login",
			"/login",
		]);
		expect(items.map((item) => item.props.id)).toEqual(["reports", "signin"]);
	});
});
