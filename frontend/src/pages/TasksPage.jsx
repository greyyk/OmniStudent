// Tasks page: manage courses + assignments, and view the priority task board.
import { useEffect, useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { features } from '../api/client';
import TaskBoard from '../components/TaskBoard';
import Calendar from '../components/Calendar';

export default function TasksPage() {
  const { tasks, setTasks } = useTasks();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    features
      .getTasks()
      .then((res) => {
        setTasks(res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      });
  }, [setTasks]);

  if (loading) return <p>Loading tasks...</p>;
  if (!tasks.length) return <p>No tasks found.</p>;

  return (
    <div>
      <h1>Tasks Page</h1>
      <TaskBoard />
      <Calendar />
    </div>
  ); 
}
