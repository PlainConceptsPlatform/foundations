import { Badge } from "@plainconceptsplatform/ui-components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@plainconceptsplatform/ui-components/table";

const rows = [
  { app: "Studio", stack: "React", status: "Active" },
  { app: "Docs", stack: "Next.js", status: "Active" },
  { app: "Legacy", stack: ".NET", status: "Deprecated" },
];

export function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>App</TableHead>
          <TableHead>Stack</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.app}>
            <TableCell className="font-medium">{row.app}</TableCell>
            <TableCell>{row.stack}</TableCell>
            <TableCell>
              <Badge variant={row.status === "Active" ? "default" : "secondary"}>
                {row.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
