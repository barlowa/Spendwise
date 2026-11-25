import { beforeEach, describe, expect, it, vi } from "vitest";
import { LandingPageContent } from "~/features/index";
import { render, screen, userEvent } from "~/test/test-utils";

const mocks = vi.hoisted(() => ({
	navigate: vi.fn(),
}));

vi.mock("react-router", async (importOriginal) => {
	const actual = await importOriginal<typeof import("react-router")>();
	return {
		...actual,
		useNavigate: () => mocks.navigate,
	};
});

vi.mock("~/components/Link", async () => {
	const { createElement } = await import("react");

	return {
		default: ({
			to,
			children,
			className,
		}: {
			to: string;
			children?: React.ReactNode;
			className?: string;
		}) => createElement("a", { href: to, className }, children),
	};
});

beforeEach(() => {
	mocks.navigate.mockReset();
});

describe("public landing page", () => {
	it("renders its public marketing message and feature sections", () => {
		render(<LandingPageContent />);

		expect(
			screen.getByRole("heading", { name: /Know where your money goes/ }),
		).not.toBeNull();
		expect(screen.getByText("Record spending")).not.toBeNull();
		expect(screen.getByText("Make updates")).not.toBeNull();
		expect(screen.getByText("Review activity")).not.toBeNull();
		expect(document.getElementById("features")).not.toBeNull();
		expect(
			screen
				.getByRole("link", { name: "Explore the basics" })
				.getAttribute("href"),
		).toBe("#features");
	});

	it("routes each sign-up call to action to login", async () => {
		const user = userEvent.setup();
		render(<LandingPageContent />);

		await user.click(
			screen.getByRole("button", { name: "Sign up to get started" }),
		);
		await user.click(
			screen.getByRole("button", { name: "Create your account" }),
		);

		expect(mocks.navigate).toHaveBeenNthCalledWith(1, "/login");
		expect(mocks.navigate).toHaveBeenNthCalledWith(2, "/login");
	});
});
