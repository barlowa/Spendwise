import { useAuth0 } from "@auth0/auth0-react-router";
import { Button, Description, Dropdown, Label, Separator } from "@heroui/react";
import {
	HiArrowRightEndOnRectangle,
	HiBanknotes,
	HiBars2,
	HiMiniChartBar,
	HiMiniUserCircle,
} from "react-icons/hi2";

export function AuthenticatedBurgerMenu() {
	const { logout } = useAuth0();
	return (
		<Dropdown>
			<Button isIconOnly aria-label="Menu" variant="secondary">
				<HiBars2 />
			</Button>
			<Dropdown.Popover>
				<Dropdown.Menu>
					<Dropdown.Section>
						<Dropdown.Item
							id="update-profile"
							textValue="Update Profile"
							href="/profile"
						>
							<div className="flex h-8 items-start justify-center pt-px">
								<HiMiniUserCircle className="size-4 shrink-0 text-muted" />
							</div>
							<div className="flex flex-col">
								<Label>User Profile</Label>
								<Description>View and edit your profile</Description>
							</div>
						</Dropdown.Item>
						<Dropdown.Item
							id="transactions"
							textValue="Transactions"
							href="/transactions"
						>
							<div className="flex h-8 items-start justify-center pt-px">
								<HiBanknotes className="size-4 shrink-0 text-muted" />
							</div>
							<div className="flex flex-col">
								<Label>Transactions</Label>
								<Description>Add and remove transactions</Description>
							</div>
						</Dropdown.Item>
						<Dropdown.Item id="reports" textValue="Reports" href="/reports">
							<div className="flex h-8 items-start justify-center pt-px">
								<HiMiniChartBar className="size-4 shrink-0 text-muted" />
							</div>
							<div className="flex flex-col">
								<Label>Reports</Label>
								<Description>View your spending report</Description>
							</div>
						</Dropdown.Item>
					</Dropdown.Section>
					<Separator />
					<Dropdown.Section>
						<Dropdown.Item
							id="signout"
							textValue="Sign Out"
							variant="danger"
							onPress={() =>
								logout({
									returnTo: "/",
								})
							}
						>
							<div className="flex h-8 items-start justify-center pt-px">
								<HiArrowRightEndOnRectangle className="size-4 shrink-0 text-danger" />
							</div>
							<div className="flex flex-col">
								<Label>Signout</Label>
							</div>
						</Dropdown.Item>
					</Dropdown.Section>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
