import http from "http";
import { exec } from "child_process";


const PORT = 3000; // Change if needed

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/github-webhook") {
    console.log("🚀 GitHub Webhook received, deploying...");
    
    // Run the deploy script
    exec("bash ~/ThemeBuilder/deploy.sh", (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Deployment failed: ${stderr}`);
        res.writeHead(500);
        res.end("Deployment Failed");
        return;
      }
      console.log(`✅ Deployment successful:\n${stdout}`);
      res.writeHead(200);
      res.end("Deployment Successful");
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`🔗 Webhook listener running on port ${PORT}`);
});
