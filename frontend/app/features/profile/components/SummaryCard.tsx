import { Avatar, Card, Chip } from "@heroui/react";
import {
	HiOutlineCheckCircle,
	HiOutlineExclamationCircle,
	HiOutlineInformationCircle,
} from "react-icons/hi2";

type ProfileSummaryCardProps = {
	name: string;
	email: string;
	picture?: string;
	emailVerified?: boolean;
};

const getInitials = (name: string) => {
	const initials = name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0])
		.join("");

	return initials.toUpperCase() || "SW";
};

export default function SummaryCard({
	name,
	email,
	picture,
	emailVerified,
}: ProfileSummaryCardProps) {
	const emailStatus =
		typeof emailVerified === "boolean"
			? emailVerified
				? "Email verified"
				: "Email not verified"
			: "Email status unavailable";

	return (
		<Card className="overflow-hidden rounded-3xl border border-border/80 bg-surface">
			<Card.Content>
				<div className="flex flex-col gap-5 sm:flex-row sm:items-end">
					<Avatar className="size-24 shrink-0 border-4 border-surface shadow-lg ring-1 ring-border">
						<Avatar.Image src={picture} alt={name} />
						<Avatar.Fallback>{getInitials(name)}</Avatar.Fallback>
					</Avatar>
					<div className="min-w-0 flex-1 pb-1">
						<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
							<h2 className="max-w-full truncate text-2xl font-semibold tracking-tight text-foreground sm:text-[1.7rem]">
								{name}
							</h2>
							<Chip
								color={
									emailVerified === true
										? "success"
										: emailVerified === false
											? "warning"
											: "default"
								}
								size="sm"
								variant="soft"
							>
								{emailVerified ? (
									<HiOutlineCheckCircle
										aria-hidden="true"
										className="size-3.5"
									/>
								) : emailVerified === false ? (
									<HiOutlineExclamationCircle
										aria-hidden="true"
										className="size-3.5"
									/>
								) : (
									<HiOutlineInformationCircle
										aria-hidden="true"
										className="size-3.5"
									/>
								)}
								<Chip.Label>{emailStatus}</Chip.Label>
							</Chip>
						</div>
						<p className="mt-1.5 truncate text-sm text-muted">
							{email || "No email address shared"}
						</p>
					</div>
				</div>
			</Card.Content>
		</Card>
	);
}
