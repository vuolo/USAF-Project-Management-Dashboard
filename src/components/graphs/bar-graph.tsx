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
import { convertDateToString } from "~/utils/date";

type Props = {
  data: any[];
  dataKey1: string;
  dataKey2: string;
};

export default function BarGraph({ data, dataKey1, dataKey2 }: Props) {

  const customTooltipFormatter = (value: number, name: string) => {  
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
      <BarChart data={data}>
        <XAxis dataKey="date" tickFormatter={dateToMonthString}/>
        <YAxis />
        <Legend />
        <Tooltip formatter={customTooltipFormatter} labelFormatter={dateToMonthString}/>
        <Bar dataKey={dataKey1} fill="steelblue" />
        <Bar dataKey={dataKey2} fill="rgb(63, 68, 71)" />
      </BarChart>
    </ResponsiveContainer>
  );
}
