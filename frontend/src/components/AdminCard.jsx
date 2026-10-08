import { Link } from "react-router-dom";

function AdminCard({ title, count, icon, to }) {
  return (
    <Link
      to={to}
      className="w-52 h-36 md:w-72 md:h-44 rounded-xl bg-white/10 md:border md:border-white/30 px-5 md:px-6 flex items-center gap-4 md:gap-6 text-white hover:scale-105 hover:bg-white/15 transition"
    >
      <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-3xl md:text-4xl">
        {icon}
      </div>

      <div className="font-serif">
        <p className="text-xl md:text-2xl italic">{title}</p>
        <p className="mt-1 text-3xl md:text-4xl">{count}</p>
      </div>
    </Link>
  );
}
export default AdminCard;