import bgLight from "@/assets/background-light.webp";
import bgDark from "@/assets/background-dark.webp";

export default function PreloadBackgrounds() {
  return (
    <div
      style={{
        backgroundImage: `url(${bgLight}), url(${bgDark})`,
        display: "none",
      }}
      aria-hidden="true"
    />
  );
}
