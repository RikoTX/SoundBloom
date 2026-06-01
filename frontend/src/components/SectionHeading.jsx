/** Section title: main text follows theme; accent stays pink. */
export default function SectionHeading({
  title,
  pinkTitle,
  className = "ml-[4%] mb-5 mt-0",
  style,
}) {
  return (
    <p
      className={`sb-section-heading ${className}`}
      style={style}
    >
      {title}
      {pinkTitle != null && pinkTitle !== "" && (
        <>
          {" "}
          <span className="sb-accent">{pinkTitle}</span>
        </>
      )}
    </p>
  );
}
