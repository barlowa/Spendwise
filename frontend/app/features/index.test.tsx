import { Button } from "@heroui/react";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LandingPageContent, meta } from "~/features/index";

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
			children?: ReactNode;
			className?: string;
		}) => createElement("a", { href: to, className }, children),
	};
});

type ElementProps = {
	children?: ReactNode;
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
	mocks.navigate.mockReset();
});

describe("public landing page", () => {
	it("renders its public marketing message and feature sections", () => {
		const markup = render(LandingPageContent());

		expect(markup).toContain("Know where your");
		expect(markup).toContain("money goes.");
		expect(markup).toContain("Record spending");
		expect(markup).toContain("Make updates");
		expect(markup).toContain("Review activity");
		expect(markup).toContain('id="features"');
		expect(markup).toContain('href="#features"');
	});

	it("routes each sign-up call to action to login", () => {
		const page = LandingPageContent();
		const buttons = findElements(page, (element) => element.type === Button);

		expect(buttons).toHaveLength(2);
		buttons[0]?.props.onPress?.();
		buttons[1]?.props.onPress?.();
		expect(mocks.navigate).toHaveBeenNthCalledWith(1, "/login");
		expect(mocks.navigate).toHaveBeenNthCalledWith(2, "/login");
	});

	it("provides public landing page metadata", () => {
		expect(meta()).toEqual([
			{ title: "Spendwise | Keep your spending in view" },
			{
				name: "description",
				content:
					"Spendwise helps you record, review, and manage everyday spending.",
			},
		]);
	});
});
