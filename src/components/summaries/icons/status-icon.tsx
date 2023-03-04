import { AlertTriangle, Circle, Square } from "lucide-react";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "ONTRACK":
    case "ON-BUDGET":
    case "green":
      return <Circle style={{ fill: "green", color: "green" }} />;
    case "BEHIND":
    case "UNDER":
    case "yellow":
      return <Square style={{ fill: "orange", color: "orange" }} />;
    case "REALLY-BEHIND":
    case "OVER":
    case "red":
      return <AlertTriangle style={{ fill: "red", color: "red" }} />;
    default:
      return <></>; //<h1>N/A</h1>;
  }
}

export default StatusIcon;
