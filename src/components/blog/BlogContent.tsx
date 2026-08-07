type BlogContentProps = {
  html: string;
};

export default function BlogContent({ html }: BlogContentProps) {
  return (
    <div
      className="blog-content mt-8 text-slate-700"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
