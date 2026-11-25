import { useAuth0 } from "@auth0/auth0-react-router";
import { Button, Description, Dropdown, Label, Separator } from "@heroui/react";
import {
	HiArrowRightStartOnRectangle,
	HiBanknotes,
	HiBars2,
	HiHome,
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
						<Dropdown.Item id="home" textValue="Home" href="/home">
							<HiHome />
							<div className="flex flex-col">
								<Label>Home</Label>
								<Description>Home dashboard</Description>
							</div>
						</Dropdown.Item>
						<Dropdown.Item
							id="update-profile"
							textValue="Profile"
							href="/profile"
						>
							<HiMiniUserCircle />
							<div className="flex flex-col">
								<Label>User Profile</Label>
								<Description>View your account details</Description>
							</div>
						</Dropdown.Item>
						<Dropdown.Item
							id="transactions"
							textValue="Transactions"
							href="/transactions"
						>
							<HiBanknotes />
							<div className="flex flex-col">
								<Label>Transactions</Label>
								<Description>Add and remove transactions</Description>
							</div>
						</Dropdown.Item>
						{/* <Dropdown.Item id="reports" textValue="Reports" href="/reports">
							<HiMiniChartBar />
							<div className="flex flex-col">
								<Label>Reports</Label>
								<Description>View your spending report</Description>
							</div>
						</Dropdown.Item> */}
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
							<HiArrowRightStartOnRectangle />
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
