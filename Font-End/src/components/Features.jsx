import film from "/film.avif";
import tv from "/tv-4k.jpg";
import mobile from "/xemfil.jpg";

export default function Features() {
  const features = [
    {
      title: "Thưởng thức trên thiết bị của bạn của bạn",
      desc: "Xem trên máy tính, laptop, smartphone.",
      img: film,
    },
    {
      title: "Xem với chất lượng video cao",
      desc: "Độ phần giải chân thực chất lượng cao 4k.",
      img: tv,
      reverse: true,
    },
    {
      title: "Xem ở mọi nơi",
      desc: "Chỉ cần thiết bị và mạng luôn có thể xem.",
      img: mobile,
    },
  ];

  return (
    <section className="bg-black py-12 pl-7">
      <div className="container mx-auto px-4 space-y-12">
        {features.map((f, i) => (
          <div key={i} className={`flex flex-col md:flex-row ${f.reverse ? "md:flex-row-reverse gap-x-10" : ""} items-center`}>
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-2xl md:text-4xl font-bold mb-4">{f.title}</h2>
              <p className="text-lg md:text-xl">{f.desc}</p>
            </div>
            <div className="md:w-1/2">
              <img src={f.img} alt="Feature" className="w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
