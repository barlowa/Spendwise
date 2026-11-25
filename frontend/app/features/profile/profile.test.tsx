import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DetailRow from "~/features/profile/components/DetailRow";
import DetailsCard from "~/features/profile/components/DetailsCard";
import SecurityCard from "~/features/profile/components/SecurityCard";
import SummaryCard from "~/features/profile/components/SummaryCard";
import { loader, ProfilePage } from "~/features/profile/index";
import { render, screen } from "~/test/test-utils";

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
		render(<ProfilePage />);

		expect(
			screen.getByRole("heading", { name: "Your profile", level: 1 }),
		).not.toBeNull();
		expect(
			screen.getByRole("heading", { name: "Jordan Doe" }),
		).not.toBeNull();
		expect(screen.getAllByText("jordan@example.com").length).toBeGreaterThan(0);
		expect(screen.getByText("Email verified")).not.toBeNull();
		expect(screen.getByText("Profile details")).not.toBeNull();
		expect(screen.getByText("Sign-in managed by Auth0")).not.toBeNull();
		expect(screen.getByRole("link", { name: "Go to transactions" }).getAttribute("href")).toBe(
			"/transactions",
		);
	});

	it("uses sensible fallbacks when Auth0 user fields are unavailable", () => {
		mocks.useUser.mockReturnValue({});
		render(<ProfilePage />);

		expect(screen.getByText("Spendwise user")).not.toBeNull();
		expect(screen.getByText("No email address shared")).not.toBeNull();
		expect(screen.getAllByText("Not provided").length).toBeGreaterThan(0);
		expect(screen.getByText("Email status unavailable")).not.toBeNull();
		expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
	});
});

describe("profile components", () => {
	it("renders the profile summary and initials fallback", () => {
		render(
			<SummaryCard
				name="Jordan Doe"
				email="jordan@example.com"
				picture="https://example.test/avatar.png"
				emailVerified
			/>,
		);

		expect(screen.getByRole("heading", { name: "Jordan Doe" })).not.toBeNull();
		expect(screen.getByText("jordan@example.com")).not.toBeNull();
		expect(screen.getByText("Email verified")).not.toBeNull();
		expect(screen.getByText("JD")).not.toBeNull();
	});

	it("shows the unverified status and fallback email when appropriate", () => {
		render(
			<SummaryCard name="Jordan Doe" email="" emailVerified={false} />,
		);

		expect(screen.getByText("Email not verified")).not.toBeNull();
		expect(screen.getByText("No email address shared")).not.toBeNull();
	});

	it("renders each available account detail and verification state", () => {
		mocks.useUser.mockReturnValue({
			name: "Jordan Doe",
			email: "jordan@example.com",
			email_verified: false,
		});
		render(<DetailsCard />);

		expect(screen.getByText("Personal information")).not.toBeNull();
		expect(screen.getByText("Jordan Doe")).not.toBeNull();
		expect(screen.getByText("jordan@example.com")).not.toBeNull();
		expect(screen.getByText("Not verified")).not.toBeNull();
		expect(screen.getByText("Auth0")).not.toBeNull();
	});

	it("renders fallback values for missing detail fields", () => {
		mocks.useUser.mockReturnValue({});
		render(<DetailsCard />);

		expect(screen.getAllByText("Not provided").length).toBeGreaterThan(0);
		expect(screen.getAllByText("Not available").length).toBeGreaterThan(0);
	});

	it("renders a semantic label/value detail row", () => {
		render(<DetailRow label="Account ID" value="abc-123" />);

		expect(screen.getByText("Account ID").tagName).toBe("DT");
		expect(screen.getByText("abc-123").tagName).toBe("DD");
	});

	it("explains how Auth0 manages account sign-in", () => {
		render(<SecurityCard />);

		expect(screen.getByText("Account security")).not.toBeNull();
		expect(screen.getByText("Sign-in managed by Auth0")).not.toBeNull();
		expect(screen.getByText("Sign-in provider")).not.toBeNull();
		expect(screen.getByText("Auth0")).not.toBeNull();
	});
});
