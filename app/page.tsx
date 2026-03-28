import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggler";
import { SignInButton, UserButton } from "@clerk/nextjs";

const page = async () => {
  return (
    <div>
      <UserButton />
      <h1>Hello world !</h1>
      <Button className="cursor-pointer">Click me !</Button>
      <ModeToggle />
      <SignInButton mode="modal">
        <Button>Checkout</Button>
      </SignInButton>
    </div>
  );
};

export default page;
