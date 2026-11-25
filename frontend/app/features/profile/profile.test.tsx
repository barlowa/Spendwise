import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailRow from "~/features/profile/components/DetailRow";
import DetailsCard from "~/features/profile/components/DetailsCard";
import SecurityCard from "~/features/profile/components/SecurityCard";
import SummaryCard from "~/features/profile/components/SummaryCard";
import { loader, meta, ProfilePage } from "~/features/profile/index";

const mocks = vi.hoisted(() => ({
	useUser: vi.fn(),
	requireSession: vi.fn(),
}));

vi.mock("@auth0/auth0-react-router", () => ({
	useUser: mocks.useUser,
}));

vi.mock("@auth0/auth0-react-router/server", () => ({
	requireSession: mocks.requireSession,
}));

vi.mock("~/components/Link", async () => {
	const { createElement } = await import("react");

	return {
		default: ({
			to,
			children,
			className,
		}: {
			to: string;
			children?: ReactNode;
			className?: string;
		}) => createElement("a", { href: to, className }, children),
	};
});

function render(node: ReactNode) {
	return renderToStaticMarkup(node);
}

function makeRouteRequest() {
	return {
		request: new Request("http://localhost/profile"),
	} as Parameters<typeof loader>[0];
}

beforeEach(() => {
	mocks.useUser.mockReset().mockReturnValue({
		name: "Jordan Doe",
		email: "jordan@example.com",
		picture: "https://example.test/avatar.png",
		email_verified: true,
	});
	mocks.requireSession.mockReset().mockResolvedValue(undefined);
});

describe("profile route", () => {
	it("requires an authenticated session and returns no route data", async () => {
		await expect(loader(makeRouteRequest())).resolves.toBeNull();
		expect(mocks.requireSession).toHaveBeenCalledOnce();
	});

	it("propagates session validation failures", async () => {
		mocks.requireSession.mockRejectedValue(new Error("Unauthenticated"));

		await expect(loader(makeRouteRequest())).rejects.toThrow("Unauthenticated");
	});

	it("renders the user profile, details, security information, and transactions link", () => {
		const markup = render(ProfilePage());

		expect(markup).toContain("Your profile");
		expect(markup).toContain("Jordan Doe");
		expect(markup).toContain("jordan@example.com");
		expect(markup).toContain("Email verified");
		expect(markup).toContain("Profile details");
		expect(markup).toContain("Sign-in managed by Auth0");
		expect(markup).toContain('href="/transactions"');
		expect(markup).toContain("Go to transactions");
	});

	it("provides profile page metadata", () => {
		expect(meta()).toEqual([
			{ title: "Your profile | Spendwise" },
			{
				name: "description",
				content:
					"View the account details connected to your Spendwise profile.",
			},
		]);
	});

	it("uses sensible fallbacks when Auth0 user fields are unavailable", () => {
		mocks.useUser.mockReturnValue({});
		const markup = render(ProfilePage());

		expect(markup).toContain("Spendwise user");
		expect(markup).toContain("No email address shared");
		expect(markup).toContain("Not provided");
		expect(markup).toContain("Email status unavailable");
		expect(markup).toContain("Not available");
	});
});

describe("profile components", () => {
	it("renders a verified profile summary with the supplied account details", () => {
		const markup = render(
			SummaryCard({
				name: "Jordan Doe",
				email: "jordan@example.com",
				picture: "https://example.test/avatar.png",
				emailVerified: true,
			}),
		);

		expect(markup).toContain("Jordan Doe");
		expect(markup).toContain("jordan@example.com");
		expect(markup).toContain("Email verified");
		expect(markup).toContain(">JD</span>");
	});

	it("shows the unverified status and fallback email when appropriate", () => {
		const markup = render(
			SummaryCard({
				name: "Jordan Doe",
				email: "",
				emailVerified: false,
			}),
		);

		expect(markup).toContain("Email not verified");
		expect(markup).toContain("No email address shared");
	});

	it("renders each available account detail and verification state", () => {
		mocks.useUser.mockReturnValue({
			name: "Jordan Doe",
			email: "jordan@example.com",
			email_verified: false,
		});
		const markup = render(DetailsCard());

		expect(markup).toContain("Personal information");
		expect(markup).toContain("Jordan Doe");
		expect(markup).toContain("jordan@example.com");
		expect(markup).toContain("Not verified");
		expect(markup).toContain("Auth0");
	});

	it("renders fallback values for missing detail fields", () => {
		mocks.useUser.mockReturnValue({});
		const markup = render(DetailsCard());

		expect(markup).toContain("Not provided");
		expect(markup).toContain("Not available");
	});

	it("renders a semantic label/value detail row", () => {
		const markup = render(DetailRow({ label: "Account ID", value: "abc-123" }));

		expect(markup).toContain("<dt");
		expect(markup).toContain("Account ID");
		expect(markup).toContain("<dd");
		expect(markup).toContain("abc-123");
	});

	it("explains how Auth0 manages account sign-in", () => {
		const markup = render(SecurityCard());

		expect(markup).toContain("Account security");
		expect(markup).toContain("Sign-in managed by Auth0");
		expect(markup).toContain("Sign-in provider");
		expect(markup).toContain("Auth0");
	});
});
