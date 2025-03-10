import { red, green, orange } from "@mui/material/colors";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import ScheduleIcon from "@mui/icons-material/Schedule";

// Priority color mapping
export const priorityColor = {
  low: green[500],
  medium: orange[500],
  high: red[500],
};

// Status icon and color mapping
export const statusConfig = {
  pending: { icon: <PendingIcon />, color: "warning", label: "Pending" },
  in_progress: { icon: <ScheduleIcon />, color: "info", label: "In Progress" },
  completed: {
    icon: <CheckCircleIcon />,
    color: "success",
    label: "Completed",
  },
};

// Get initials from name
export const getInitials = (name) => {
  const names = name.split(" ");
  return names
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};
