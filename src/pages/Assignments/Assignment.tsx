import { Button, Col, Container, Row, Form } from "react-bootstrap";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { assignmentColumns as ASSIGNMENT_COLUMNS } from "./AssignmentColumns";
import { BsFileText, BsTrash } from "react-icons/bs";
import DeleteAssignment from "./AssignmentDelete";
import { IAssignmentResponse } from "../../utils/interfaces";
import { RootState } from "../../store/store";
import { Row as TRow } from "@tanstack/react-table";
import Table from "components/Table/Table";
import { alertActions } from "store/slices/alertSlice";
import useAPI from "hooks/useAPI";


const Assignments = () => {
  const { error, isLoading, data: assignmentResponse, sendRequest: fetchAssignments } = useAPI();
  const { data: coursesResponse, sendRequest: fetchCourses } = useAPI();


  const auth = useSelector(
    (state: RootState) => state.authentication,
    (prev, next) => prev.isAuthenticated === next.isAuthenticated
  );
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState<{
    visible: boolean;
    data?: IAssignmentResponse;
  }>({ visible: false });

  const [selectedAssignments, setSelectedAssignments] = useState<number[]>([]);


  const fetchData = useCallback(async () => {
    try {
      const [assignments, courses] = await Promise.all([
        fetchAssignments({ url: `/assignments` }),
        fetchCourses({ url: '/courses' }),
      ]);
      // Handle the responses as needed
    } catch (err) {
      // Handle any errors that occur during the fetch
      console.error("Error fetching data:", err);
    }
  }, [fetchAssignments, fetchCourses]);

  useEffect(() => {
    if (!showDeleteConfirmation.visible) {
      fetchData();
    }
  }, [fetchData, showDeleteConfirmation.visible, auth.user.id]);

  let mergedData: Array<any & { courseName?: string }> = [];

  if (assignmentResponse && coursesResponse) {
    mergedData = assignmentResponse.data.map((assignment: any) => {
      const course = coursesResponse.data.find((c: any) => c.id === assignment.course_id);
      return { ...assignment, courseName: course ? course.name : 'Unknown' };
    });
  }



  // Error alert
  useEffect(() => {
    if (error) {
      dispatch(alertActions.showAlert({ variant: "danger", message: error }));
    }
  }, [error, dispatch]);

  const onDeleteAssignmentHandler = useCallback(() => setShowDeleteConfirmation({ visible: false }), []);

  const onEditHandle = useCallback(
    (row: TRow<IAssignmentResponse>) => navigate(`edit/${row.original.id}`),
    [navigate]
  );

  const onDeleteHandle = useCallback(
    (row: TRow<IAssignmentResponse>) => setShowDeleteConfirmation({ visible: true, data: row.original }),
    []
  );

  const handleAssignmentSelect = useCallback((assignmentId: number, isSelected: boolean) => {
    setSelectedAssignments(prev => 
      isSelected 
        ? [...prev, assignmentId]
        : prev.filter(id => id !== assignmentId)
    );
  }, []);

  const handleSelectAll = useCallback((isSelected: boolean) => {
    setSelectedAssignments(isSelected ? mergedData.map((a: any) => a.id) : []);
  }, [mergedData]);

  const handleBulkDelete = useCallback(() => {
    if (selectedAssignments.length > 0) {
      // Handle bulk delete logic here
      console.log('Bulk deleting assignments:', selectedAssignments);
      // You can implement the actual bulk delete API call here
      setSelectedAssignments([]);
    }
  }, [selectedAssignments]);

  const tableColumns = useMemo(
    () => ASSIGNMENT_COLUMNS(onEditHandle, onDeleteHandle, handleAssignmentSelect, handleSelectAll, selectedAssignments, mergedData || []),
    [onDeleteHandle, onEditHandle, handleAssignmentSelect, handleSelectAll, selectedAssignments, mergedData]
  );

  const tableData = useMemo(
    () => (isLoading || !mergedData?.length ? [] : mergedData),
    [mergedData, isLoading]
  );

  return (
    <>
      <Outlet />
      <main>
        <Container fluid className="px-md-4">
          <Row className="mt-md-2 mb-md-2">
            <Col className="text-center">
              <h1>Manage Assignments</h1>
            </Col>
            <hr />
          </Row>
          <Row>
            <Col md={6}>
              {selectedAssignments.length > 0 && (
                <Button 
                  variant="outline-danger" 
                  onClick={handleBulkDelete}
                  className="d-flex align-items-center me-2"
                >
                  <BsTrash className="me-1" />
                  Delete Selected ({selectedAssignments.length})
                </Button>
              )}
            </Col>
            <Col md={6} className="text-end">
              <Button variant="outline-info" onClick={() => navigate("new")} className="d-flex align-items-center">
                <span className="me-1">Create</span><BsFileText />
              </Button>
            </Col>
            {showDeleteConfirmation.visible && (
              <DeleteAssignment assignmentData={showDeleteConfirmation.data!} onClose={onDeleteAssignmentHandler} />
            )}
          </Row>
          <Row>
            <Table
              data={tableData}
              columns={tableColumns}
              columnVisibility={{
                id: false,

              }}
            />
          </Row>
        </Container>
      </main>
    </>
  );
};

export default Assignments;