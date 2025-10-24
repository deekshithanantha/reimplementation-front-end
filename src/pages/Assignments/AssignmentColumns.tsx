import { BsPencilFill, BsPersonXFill } from "react-icons/bs";
import { Row, createColumnHelper } from "@tanstack/react-table";
import { Button, Form } from "react-bootstrap";
import { IAssignmentResponse as IAssignment } from "../../utils/interfaces";

type Fn = (row: Row<IAssignment>) => void;
type SelectFn = (id: number, isSelected: boolean) => void;
type SelectAllFn = (isSelected: boolean) => void;

const columnHelper = createColumnHelper<IAssignment>();
export const assignmentColumns = (
  handleEdit: Fn, 
  handleDelete: Fn, 
  handleSelect: SelectFn, 
  handleSelectAll: SelectAllFn,
  selectedAssignments: number[],
  data: any[]
) => [
  columnHelper.display({
    id: "select",
    header: () => (
      <Form.Check
        type="checkbox"
        checked={selectedAssignments.length === data.length && data.length > 0}
        onChange={(e) => handleSelectAll(e.target.checked)}
        style={{ width: '30px' }}
      />
    ),
    cell: ({ row }) => (
      <Form.Check
        type="checkbox"
        checked={selectedAssignments.includes(row.original.id)}
        onChange={(e) => handleSelect(row.original.id, e.target.checked)}
        style={{ width: '30px' }}
      />
    ),
    size: 40,
  }),
  columnHelper.accessor("name", {
    header: "Name",
  }),
  columnHelper.accessor("courseName", {
    header: "Course Name",
  }),
  columnHelper.accessor("created_at", {
    header: "Creation Date",
  }),

  columnHelper.accessor("updated_at", {
    header: "Updated Date",
  }),

  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <>
        <Button variant="outline-warning" size="sm" onClick={() => handleEdit(row)} title="Edit">
          <BsPencilFill />
        </Button>
        <Button
          variant="outline-danger"
          size="sm"
          className="ms-sm-2"
          onClick={() => handleDelete(row)}
          title="Delete"
        >
          <BsPersonXFill />
        </Button>
      </>
    ),
  }),
];