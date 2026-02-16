import CardSwitcher from "@/shared/ui/CardSwitcher";

export default function AlphaExamplePage() {
  return (
    <div className="w-full">
      <CardSwitcher blur={true} className="mt-[100px]" />
      <CardSwitcher brightest={true} className="mt-[500px] mb-[300px]" />
    </div>
  );
}
