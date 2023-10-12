import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "~/utils/currency";

type Props = {
  data: any[];
  dataKey1: string;
  dataKey2: string;
};

export default function BarGraph({ data, dataKey1, dataKey2 }: Props) {

  const customTooltipFormatter = (value: number, name: string) => {
    // Check if the value should be formatted as currency
    if (name === dataKey1 || name === dataKey2) {
      return formatCurrency(value);
    }
    return value;
  };

  return (
    <ResponsiveContainer height="90%" aspect={4 / 1}>
      <BarChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Legend />
        <Tooltip formatter={customTooltipFormatter}/>
        <Bar dataKey={dataKey1} fill="steelblue" />
        <Bar dataKey={dataKey2} fill="rgb(63, 68, 71)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
