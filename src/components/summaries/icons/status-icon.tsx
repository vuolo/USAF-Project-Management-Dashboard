import { AlertTriangle, Circle, Square } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "ONTRACK":
      return <Circle style={{ fill: "green", color: "green" }} />;
    case "BEHIND":
      return <Square style={{ fill: "orange", color: "orange" }} />;
    case "REALLY-BEHIND":
      return <AlertTriangle style={{ fill: "red", color: "red" }} />;
    default:
      return <h1>N/A</h1>;
  }
}

export default StatusIcon;
