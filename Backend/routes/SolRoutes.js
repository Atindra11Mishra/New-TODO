const express = require("express");
const { Web3 } = require('web3');
require("dotenv").config();

const router = express.Router();

// Connect to the blockchain
const web3 = new Web3(process.env.SEPOLINA_RPC_URL); // Ensure RPC URL is correct
const contractAddress = process.env.CONTRACT_ADDRESS;
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_content",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_timestamp",
				"type": "uint256"
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
				"name": "_taskId",
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
				"name": "_taskId",
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
				"name": "_taskId",
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
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taskId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"name": "TaskAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taskId",
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
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taskId",
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
				"indexed": true,
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taskId",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_taskId",
				"type": "uint256"
			}
		],
		"name": "getTask",
		"outputs": [
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
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
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tasks",
		"outputs": [
			{
				"internalType": "string",
				"name": "content",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "deleted",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const contract = new web3.eth.Contract(contractABI, contractAddress);
const senderAddress = process.env.SENDER_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

// Helper function to send transactions
const sendTransaction = async (tx, res) => {
    try {
        const gas = await tx.estimateGas({ from: senderAddress });
        const txData = {
            from: senderAddress,
            to: contractAddress,
            gas,
            data: tx.encodeABI(),
        };

        const signedTx = await web3.eth.accounts.signTransaction(txData, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        res.json({ success: true, receipt });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// API: Add a new task
router.post("/add-task", async (req, res) => {
    const { taskHash } = req.body;
    const tx = contract.methods.addTask(taskHash);
    await sendTransaction(tx, res);
});

// API: Mark task as complete
router.post("/complete-task", async (req, res) => {
    const { taskId } = req.body;
    const tx = contract.methods.completeTask(taskId);
    await sendTransaction(tx, res);
});

// API: Edit a task
router.post("/edit-task", async (req, res) => {
    const { taskId, newContent } = req.body;
    if (!taskId || !newContent) {
        return res.status(400).json({ success: false, error: "Missing parameters" });
    }
    const tx = contract.methods.editTask(taskId, newContent);
    await sendTransaction(tx, res);
});

// API: Delete a task
router.post("/delete-task", async (req, res) => {
    const { taskId } = req.body;
    if (!taskId) {
        return res.status(400).json({ success: false, error: "Task ID is required" });
    }
    const tx = contract.methods.deleteTask(taskId);
    await sendTransaction(tx, res);
});

// API: Get task details
router.get("/get-task/:id", async (req, res) => {
    const taskId = req.params.id;
    try {
        const task = await contract.methods.getTask(taskId).call();
        res.json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;