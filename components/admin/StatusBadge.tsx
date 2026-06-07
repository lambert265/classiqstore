const statusStyles: Record<string, string> = {
  pending_confirmation: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  confirmed:            "bg-green-500/10 text-green-300 border-green-500/20",
  processing:           "bg-blue-500/10 text-blue-300 border-blue-500/20",
  shipped:              "bg-purple-500/10 text-purple-300 border-purple-500/20",
  delivered:            "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  cancelled:            "bg-red-500/10 text-red-300 border-red-500/20",
  pending:              "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
  in_progress:          "bg-blue-500/10 text-blue-300 border-blue-500/20",
  quoted:               "bg-purple-500/10 text-purple-300 border-purple-500/20",
  accepted:             "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  completed:            "bg-white/8 text-white/40 border-white/10",
};

const dotColors: Record<string, string> = {
  pending_confirmation: "bg-yellow-400",
  confirmed:            "bg-green-400",
  processing:           "bg-blue-400",
  shipped:              "bg-purple-400",
  delivered:            "bg-emerald-400",
  cancelled:            "bg-red-400",
  pending:              "bg-yellow-400",
  in_progress:          "bg-blue-400",
  quoted:               "bg-purple-400",
  accepted:             "bg-emerald-400",
  completed:            "bg-white/30",
};

const labels: Record<string, string> = {
  pending_confirmation: "Pending",
  confirmed:            "Confirmed",
  processing:           "Processing",
  shipped:              "Shipped",
  delivered:            "Delivered",
  cancelled:            "Cancelled",
  pending:              "Pending",
  in_progress:          "In Progress",
  quoted:               "Quoted",
  accepted:             "Accepted",
  completed:            "Completed",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border font-body ${statusStyles[status] ?? "bg-white/8 text-white/40 border-white/10"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status] ?? "bg-white/30"}`} />
      {labels[status] ?? status}
    </span>
  );
}
