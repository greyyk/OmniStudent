import { createContext, useContext } from 'react'

const TasksContext = createContext({
  tasksList: [],
  addTask: () => {},
  removeTask: () => {},
  loading: false,
})

export function TasksProvider({ children }) {
  return (
    <TasksContext.Provider
      value={{
        tasksList: [],
        addTask: () => {},
        removeTask: () => {},
        loading: false,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  return useContext(TasksContext)
}

// The original task-loading version is commented out because it breaks the app.
// It imports `tasks` from ../api/client, but api/client.js does not export
// `tasks`. The backend calls these records `assignments`, and TasksPage now
// talks directly to the `assignments` API instead.
//
// import { createContext, useContext, useEffect, useState } from 'react'
// import { tasks } from '../api/client'
//
// const TasksContext = createContext(null)
//
// export function TasksProvider({ children }) {
//   const [tasksList, setTasksList] = useState([])
//   const [loading, setLoading] = useState(true)
//
//   useEffect(() => {
//     const storedTasks = localStorage.getItem('tasks')
//
//     if (storedTasks) {
//       setTasksList(JSON.parse(storedTasks))
//       setLoading(false)
//       return
//     }
//
//     tasks
//       .getAll()
//       .then((res) => {
//         setTasksList(res.data)
//         localStorage.setItem('tasks', JSON.stringify(res.data))
//       })
//       .catch(() => localStorage.removeItem('tasks'))
//       .finally(() => setLoading(false))
//   }, [])
//
//   function addTask(task) {
//     const updatedTasks = [...tasksList, task]
//     setTasksList(updatedTasks)
//     localStorage.setItem('tasks', JSON.stringify(updatedTasks))
//   }
//
//   function removeTask(taskId) {
//     const updatedTasks = tasksList.filter((task) => task.id !== taskId)
//     setTasksList(updatedTasks)
//     localStorage.setItem('tasks', JSON.stringify(updatedTasks))
//   }
//
//   return (
//     <TasksContext.Provider value={{ tasksList, addTask, removeTask, loading }}>
//       {children}
//     </TasksContext.Provider>
//   )
// }
//
// export function useTasks() {
//   const ctx = useContext(TasksContext)
//   if (!ctx) throw new Error('useTasks must be used inside <TasksProvider>')
//   return ctx
// }
