import AdminSearch from "./AdminSearch";
import { Link } from "react-router-dom";

function AdminSearchArchive({ onProductSelect }) {
  return (
    <div>
      <div className="flex justify-between items-center pt-10">
        {/* Group both buttons together */}
        <div className="flex items-center gap-2">
          <Link
            to="/AdminProducts"
            className="w-40 md:w-60 h-8 md:h-10 rounded-full bg-white/15 backdrop-blur-lg border border-white/30 shadow-sm text-white text-sm md:text-2xl flex items-center justify-center hover:scale-105 cursor-pointer transition"
          >
            Back to Products
          </Link>
        </div>
        <AdminSearch onProductSelect={onProductSelect} />
      </div>
    </div>
  );
}

export default AdminSearchArchive;