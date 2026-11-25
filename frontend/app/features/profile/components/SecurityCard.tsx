import { Card } from "@heroui/react";
import { HiOutlineShieldCheck } from "react-icons/hi2";

export default function SecurityCard() {
	return (
		<Card className="h-fit rounded-3xl shadow-sm border border-border/80">
			<Card.Content>
				<div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
					<HiOutlineShieldCheck aria-hidden="true" className="size-6" />
				</div>
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
					Account security
				</p>
				<h2 className="mt-4 text-lg font-semibold text-foreground">
					Sign-in managed by Auth0
				</h2>
				<p className="mt-2 text-sm leading-6 text-muted">
					Auth0 handles authentication for Spendwise. Your sign-in credentials
					aren't stored in the app.
				</p>
				<div className="mt-6 flex items-center justify-between gap-4 border-t border-border/80 pt-5">
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
						Sign-in provider
					</p>
					<p className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<span
							aria-hidden="true"
							className="size-2 rounded-full bg-accent"
						/>
						Auth0
					</p>
				</div>
			</Card.Content>
		</Card>
	);
}
