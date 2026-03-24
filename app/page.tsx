import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/theme-toggler';

const page = () => {
  return (
    <div>
      <h1>Hello world !</h1>
      <Button className="cursor-pointer">Click me !</Button>
      <ModeToggle />
    </div>
  );
};

export default page;
