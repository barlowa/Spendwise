import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

if (!globalThis.CSS?.escape) {
	Object.defineProperty(globalThis, "CSS", {
		configurable: true,
		value: {
			...globalThis.CSS,
			escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "\\$&"),
		},
	});
}

afterEach(cleanup);
