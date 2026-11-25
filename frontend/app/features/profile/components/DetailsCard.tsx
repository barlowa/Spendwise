import { useUser } from "@auth0/auth0-react-router";
import { Card } from "@heroui/react";
import { HiOutlineIdentification } from "react-icons/hi2";
import { DetailRow } from "~/features/profile/components/DetailRow";

export function DetailsCard() {
	const user = useUser();

	const details = [
		{ label: "Name", value: user?.name },
		{ label: "Email address", value: user?.email || "Not provided" },
		{
			label: "Email verification",
			value:
				typeof user?.email_verified === "boolean"
					? user.email_verified
						? "Verified"
						: "Not verified"
					: "Not available",
		},
		{ label: "Sign-in service", value: "Auth0" },
	];
	return (
		<Card className="rounded-3xl border border-border/80 bg-surface shadow-sm">
			<Card.Header className="flex-row items-center gap-4 ">
				<div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-surface-secondary text-accent">
					<HiOutlineIdentification aria-hidden="true" className="size-5" />
				</div>
				<div>
					<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
						Personal information
					</p>
					<Card.Title className="mt-1">Profile details</Card.Title>
					<Card.Description className="mt-1">
						Details shared by your sign-in account
					</Card.Description>
				</div>
			</Card.Header>
			<Card.Content className="px-3">
				<dl>
					{details.map((detail) => (
						<DetailRow
							key={detail.label}
							label={detail.label}
							value={detail?.value ?? ""}
						/>
					))}
				</dl>
			</Card.Content>
		</Card>
	);
}
