import { Button, Description, Dropdown, Label, Separator } from "@heroui/react";
import {
	HiArrowRightEndOnRectangle,
	HiBars2,
	HiMiniUserCircle,
	HiMiniUserPlus,
} from "react-icons/hi2";

export function UnauthenticatedBurgerMenu() {
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
							<HiMiniUserCircle />
							<div className="flex flex-col">
								<Label>User Profile</Label>
								<Description>View and edit your profile</Description>
							</div>
						</Dropdown.Item>
						<Dropdown.Item id="reports" textValue="Reports" href="/login">
							<HiMiniUserPlus />
							<div className="flex flex-col">
								<Label>Sign Up</Label>
								<Description>Sign up for a spendwise account</Description>
							</div>
						</Dropdown.Item>
					</Dropdown.Section>
					<Separator />
					<Dropdown.Section>
						<Dropdown.Item id="signin" textValue="Sign In" href="/login">
							<HiArrowRightEndOnRectangle />
							<Label>Sign in</Label>
						</Dropdown.Item>
					</Dropdown.Section>
				</Dropdown.Menu>
			</Dropdown.Popover>
		</Dropdown>
	);
}
