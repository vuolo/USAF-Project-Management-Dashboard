import { AlertTriangle, Circle, Square } from "lucide-react";
import { Tooltip } from "react-tooltip";

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "ONTRACK":
    case "ON-BUDGET":
    case "green":
      return (<div><Circle style={{ fill: "green", color: "green" }}
        data-tooltip-id="icon-tooltip"
        data-tooltip-content={status} />
        <Tooltip id="icon-tooltip" style={{ opacity: 80 }} /></div>);
    case "BEHIND":
    case "UNDER":
    case "yellow":
      return (<div><Square style={{ fill: "orange", color: "orange" }}
        data-tooltip-id="icon-tooltip"
        data-tooltip-content={status} />
        <Tooltip id="icon-tooltip" style={{ opacity: 80 }} /></div>);
    case "REALLY-BEHIND":
    case "OVER":
    case "red":
      return (<div><AlertTriangle style={{ fill: "red", color: "red" }}
        data-tooltip-id="icon-tooltip"
        data-tooltip-content={status} />
        <Tooltip id="icon-tooltip" style={{ opacity: 80 }} /></div>);
    default:
      return <h1>...</h1>; //<></>; //<h1>N/A</h1>;
  }
}

export default StatusIcon;
