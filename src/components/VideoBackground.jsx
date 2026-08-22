export default function VideoBackground() {
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <img
        src="/bg-image.jpg"
        alt=""
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-sand/40" />
    </div>
  );
}