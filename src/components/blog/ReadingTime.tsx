type ReadingTimeProps = {
  value?: string;
};

export default function ReadingTime({ value }: ReadingTimeProps) {
  if (!value) return null;
  return <span>{value}</span>;
}
