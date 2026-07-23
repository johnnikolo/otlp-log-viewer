import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type OnChangeFn,
} from "@tanstack/react-table";
import { NormalizedLogRecord } from "@/types/otlp";
import { logTableColumns } from "../logTableColumns";

export function useLogTable(
  records: NormalizedLogRecord[],
  sorting: SortingState,
  onSortingChange: OnChangeFn<SortingState>,
) {
  return useReactTable({
    data: records,
    columns: logTableColumns,
    state: { sorting },
    onSortingChange,
    enableSortingRemoval: false,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
}
