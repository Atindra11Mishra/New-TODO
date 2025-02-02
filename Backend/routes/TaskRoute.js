const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const router = express.Router();

// Define the path to the GPT4All executable
const reasonerExecutablePath = path.join("D:", "Coding", "bin", "chat.exe");

// Middleware to sanitize input
const sanitizeInput = (req, res, next) => {
  const { task } = req.query;
  if (!task) {
    return res.status(400).json({ error: "Task content is required." });
  }
  // Remove any characters that could be used for command injection
  req.sanitizedTask = task.replace(/[&|;$()<>]/g, '');
  next();
};

router.get("/prompt", sanitizeInput, async (req, res) => {
  try {
    const aiSuggestion = await getAISuggestion(req.sanitizedTask);
    res.json({ suggestion: aiSuggestion });
  } catch (error) {
    console.error("Error generating AI prompt:", error);
    res.status(500).json({ error: "Failed to generate AI prompt." });
  }
});

const getAISuggestion = async (taskContent) => {
  return new Promise((resolve, reject) => {
    // Check if executable exists
    try {
      // Spawn the chat.exe process with specific arguments to run in non-interactive mode
      const gpt4all = spawn(reasonerExecutablePath, ['--no-interactive'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let response = '';
      let errorOutput = '';

      // Handle the model's output
      gpt4all.stdout.on('data', (data) => {
        response += data.toString();
        console.log('Received data:', data.toString()); // Debug log
      });

      gpt4all.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error('Error data:', data.toString()); // Debug log
      });

      // Handle process completion
      gpt4all.on('close', (code) => {
        console.log('Process closed with code:', code); // Debug log
        if (code !== 0) {
          reject(new Error(`GPT4All process exited with code ${code}: ${errorOutput}`));
          return;
        }
        resolve(response.trim() || "AI suggestion unavailable at the moment.");
      });

      // Write the prompt to the model
      const prompt = `Task: "${taskContent}"\nProvide a brief, helpful suggestion or break this task into smaller steps:\n`;
      console.log('Sending prompt:', prompt); // Debug log
      gpt4all.stdin.write(prompt);
      gpt4all.stdin.end();

      // Handle any errors in the process
      gpt4all.on('error', (error) => {
        console.error('Process error:', error); // Debug log
        reject(new Error(`Failed to start GPT4All process: ${error.message}`));
      });

      // Set a timeout to kill the process if it takes too long
      setTimeout(() => {
        gpt4all.kill();
        reject(new Error('GPT4All process timed out'));
      }, 30000); // 30 second timeout

    } catch (error) {
      console.error('Spawn error:', error); // Debug log
      reject(new Error(`Failed to start GPT4All process: ${error.message}`));
    }
  });
};

module.exports = router;