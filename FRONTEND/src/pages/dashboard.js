import KanbanBoard from "../components/tasks/KanbanBoard";
import TaskList from "../components/tasks/TaskList";

const Dashboard = () => {
  return (
    <>
      <h1>Bienvenue sur le Dashboard</h1>
      <KanbanBoard />
      {/* <TaskList /> */}
    </>
  );
};

export default Dashboard;
