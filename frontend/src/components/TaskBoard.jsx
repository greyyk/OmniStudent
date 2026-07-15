// Priority Task Board: assignments ranked high/medium/low.
import { useEffect, useState } from 'react';
import { useTasks } from '../contexts/TasksContext';
import { features } from '../api/client';


export default function TaskBoard() {
  const { tasks } = useTasks();
  const [loading, setLoading] = useState(true);
  const priorityLevels = ['High', 'Medium', 'Low'];


    useEffect(() => {
    features
      .prioritizedTasks()
      .then((res) => {
        // Assuming the API returns tasks with a 'priority' field
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching prioritized tasks:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading priority tasks...</p>;
  if (!tasks.length) return <p>No tasks found.</p>; 

  return (
    <div className="task-board">
      {priorityLevels.map((level) => (
        <div key={level} className={`task-column ${level.toLowerCase()}`}>
          <h2>{level} Priorities</h2>
          <ul>
            {tasks
              .filter((task) => task.priority === level)
              .map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}// Priority Task Board: assignments ranked high/medium/low.
