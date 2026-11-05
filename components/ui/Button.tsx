import Link from "next/link";

type Props = { children: React.ReactNode; href?: string; className?: string; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean };
export function Button({ children, href, className = "", onClick, type = "button", disabled = false }: Props) {
  const classes = `button ${className}`;
  return href ? <Link href={href} className={classes}>{children}</Link> : <button type={type} className={classes} onClick={onClick} disabled={disabled}>{children}</button>;
}
