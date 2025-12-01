interface Props {
  title: string;
  description: string;
}

export const AIGenerationTitle = ({ title, description }: Props) => {
  return (
    <div className="w-full max-w-3xl mx-auto text-center mb-8 sm:mb-10">
      <p className="font-bold text-[34px] sm:text-[44px] leading-[1.2] sm:leading-[1]">
        {title}
      </p>

      <p className="mt-2 sm:mt-4 font-base">{description}</p>
    </div>
  );
};
