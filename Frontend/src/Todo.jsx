import { useState, useEffect } from "react";
import Web3 from "web3";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";

import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_content",
				"type": "string"
			}
		],
		"name": "addTask",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "completeTask",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "deleteTask",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_newContent",
				"type": "string"
			}
		],
		"name": "editTask",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "content",
				"type": "string"
			}
		],
		"name": "TaskAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "TaskCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "TaskDeleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newContent",
				"type": "string"
			}
		],
		"name": "TaskEdited",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getCompletionRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getTask",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "taskCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tasks",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

const contractAddress = "0x88288d1025CC8EC76fB8676aAD94304E406fb774";

function Todo() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTaskText, setEditTaskText] = useState("");
  const [aiPrompts, setAiPrompts] = useState({});  // Store AI responses for each task

  useEffect(() => {
    const initBlockchain = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const contractInstance = new web3Instance.eth.Contract(
          contractABI,
          contractAddress
        );
        setWeb3(web3Instance);
        setContract(contractInstance);
        toast.success("Connected to blockchain!");
      } else {
        toast.error("Please install MetaMask to use this dApp!");
      }
    };
    initBlockchain();
  }, []);

  const fetchTasks = async () => {
    if (!contract) return;
    try {
      const taskCount = await contract.methods.taskCount().call();
      const fetchedTasks = [];
      for (let i = 0; i < taskCount; i++) {
        const task = await contract.methods.getTask(i).call();
        fetchedTasks.push(task);
      }
      setTasks(fetchedTasks);
    } catch (error) {
      toast.error("Failed to fetch tasks!");
      console.log(error.message);
    }
  };

  const addTask = async () => {
    if (!newTask) return;
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.addTask(newTask).send({ from: accounts[0] });
      toast.success("Task added successfully!");
      fetchTasks();
      setNewTask("");
    } catch (error) {
      toast.error("Failed to add task!");
    }
  };

  const completeTask = async (id) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.completeTask(id).send({ from: accounts[0] });
      toast.success("Task completed!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to complete task!");
    }
  };

  const deleteTask = async (id) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.deleteTask(id).send({ from: accounts[0] });
      toast.success("Task deleted!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to delete task!");
      console.log(error.message);
    }
  };

  const editTask = async (id) => {
    try {
      const accounts = await web3.eth.getAccounts();
      await contract.methods.editTask(id, editTaskText).send({ from: accounts[0] });
      toast.success("Task updated!");
      fetchTasks();
      setEditTaskId(null);
      setEditTaskText("");
    } catch (error) {
      toast.error("Failed to edit task!");
      console.log(error.message);
    }
  };

  const fetchAIPrompt = async (taskContent, taskId) => {
    try {
      setAiPrompts(prev => ({ ...prev, [taskId]: true }));
      
      const response = await axios.get("http://localhost:5000/api/ai/prompt", {
        params: { task: taskContent }
      });
      
      if (response.data.suggestion) {
        setAiPrompts(prev => ({
          ...prev,
          [taskId]: response.data.suggestion
        }));
      }
    } catch (error) {
      console.error("AI Fetch Error:", error);
      toast.error("Failed to fetch AI suggestion");
    } finally {
      setAiPrompts(prev => ({ ...prev, [taskId]: false }));
    }
  };
  
  useEffect(() => {
    if (contract) fetchTasks();
  }, [contract]);

  const completedTasks = tasks.filter((task) => task[2]).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 text-white p-6">
      <ToastContainer />
      <h1 className="text-4xl font-bold mb-6 text-teal-400">Decentralized To-Do App</h1>
      <div className="w-full max-w-md">
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Enter task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <button
            onClick={addTask}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg"
          >
            Add
          </button>
        </div>
        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
        <ul className="space-y-2">
          {tasks.map((task, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              {editTaskId === task[0] ? (
                <>
                  <input
                    type="text"
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    className="px-2 py-1 rounded-lg bg-gray-700 text-white"
                  />
                  <button
                    onClick={() => editTask(task[0])}
                    className="ml-2 px-2 py-1 bg-green-500 hover:bg-green-600 rounded-lg"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <span className={`flex-1 ${task[2] ? "line-through text-gray-500" : ""}`}>
                    {task[1]}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => completeTask(task[0])}
                      className="px-2 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg"
                    >
                      ✔
                    </button>
                    <button
                      onClick={() => deleteTask(task[0])}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 rounded-lg"
                    >
                      ✖
                    </button>
                    <button
                      onClick={() => {
                        setEditTaskId(task[0]);
                        setEditTaskText(task[1]);
                      }}
                      className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 rounded-lg"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => fetchAIPrompt(task[1], task[0])}  // Fetch AI prompt on task click
                      className="px-2 py-1 bg-purple-500 hover:bg-purple-600 rounded-lg"
                    >
                      🧠 AI Prompt
                    </button>
                  </div>
                </>
              )}
              {/* Display AI prompt response */}
              {aiPrompts[task[0]] && (
                <div className="mt-2 text-gray-300 bg-gray-700 p-2 rounded-md">
                  <strong>AI Suggestion:</strong> {aiPrompts[task[0]]}
                </div>
              )}
            </li>
          ))}
        </ul>
        <h3 className="mt-6 text-lg font-semibold">Completion Rate: {completionRate}%</h3>
      </div>
    </div>
  );
}

export default Todo;