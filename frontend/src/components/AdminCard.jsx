import { Link } from "react-router-dom";

function AdminCard({ title, count, icon, to }) {
  return (
    <Link
      to={to}
      className="w-52 h-36 rounded-xl bg-white/10 border border-white/20 px-5 flex items-center gap-4 text-white hover:scale-105 hover:bg-white/15 transition"
    >
      <div className="w-20 h-20 shrink-0 rounded-full bg-white/20 flex items-center justify-center text-3xl">
        {icon}
      </div>

      <div className="font-serif">
        <p className="text-xl italic">{title}</p>
        <p className="mt-1 text-3xl">{count}</p>
      </div>
    </Link>
  );
}

export default AdminCard;