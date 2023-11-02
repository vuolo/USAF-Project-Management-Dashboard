import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "~/utils/currency";
import { convertDateToString } from "~/utils/date";

type Props = {
  data: any[];
  dataKey1: string;
  dataKey2: string;
};

export default function LineGraph({ data, dataKey1, dataKey2 }: Props) {
  const customTooltipFormatter = (value: number, name: string) => {
    // Check if the value should be formatted as currency
    if (name === dataKey1 || name === dataKey2) {
      return formatCurrency(value);
    }
    return value;
  };

  const dateToMonthString = (date: string) => {
    return convertDateToString(new Date(date));
  };
  
  return (
    <ResponsiveContainer height="90%" aspect={4 / 1}>
      <LineChart data={data}>
        <XAxis dataKey="date" tickFormatter={dateToMonthString}/>
        <YAxis />
        <Legend />
        <Tooltip formatter={customTooltipFormatter} labelFormatter={dateToMonthString}/>
        <Line
          type="monotone"
          dataKey={dataKey1}
          strokeWidth="2"
          stroke="steelblue"
        />
        <Line
          type="monotone"
          dataKey={dataKey2}
          strokeWidth="2"
          stroke="rgb(63, 68, 71)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
