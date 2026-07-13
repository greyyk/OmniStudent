// Simple calendar: events grouped by day, color-coded by type.
// Global feature & task state. Stores the tasks in localStorage so a page refresh keeps the tasks.
import { createContext, useContext, useEffect, useState } from 'react'
import { tasks } from '../api/client'

const TasksContext = createContext(null)

export function TasksProvider({ children }) {
  const [tasksList, setTasksList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks')
    
    if (storedTasks) {
      setTasksList(JSON.parse(storedTasks))
      setLoading(false)
      return
    }
    // Fetch tasks from the API.
    tasks
      .getAll()
      .then((res) => {
        setTasksList(res.data)
        localStorage.setItem('tasks', JSON.stringify(res.data))
      })
      .catch(() => localStorage.removeItem('tasks'))
      .finally(() => setLoading(false))
  }, [])

  function addTask(task) {
    const updatedTasks = [...tasksList, task]
    setTasksList(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  function removeTask(taskId) {
    const updatedTasks = tasksList.filter((task) => task.id !== taskId)
    setTasksList(updatedTasks)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
  }

  return (
    <TasksContext.Provider value={{ tasksList, addTask, removeTask, loading }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TasksContext)
  if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>')
  return ctx
}
