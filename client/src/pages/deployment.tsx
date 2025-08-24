import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Circle, ExternalLink, Copy, Download, Server, Cloud, Rocket, Code, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  command?: string;
}

export default function DeploymentPage() {
  const { toast } = useToast();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  
  const toggleStep = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Command copied to clipboard",
    });
  };

  const envVars = [
    { name: "DATABASE_URL", description: "PostgreSQL database connection string", required: true },
    { name: "SESSION_SECRET", description: "Secret key for session management", required: true },
    { name: "COINGECKO_API_KEY", description: "CoinGecko API key for price data", required: true },
    { name: "PYTH_RPC_URL", description: "Pyth Network RPC endpoint", required: true },
    { name: "ETHERSCAN_API_KEY", description: "Etherscan API key for transaction monitoring", required: false },
    { name: "FIREBASE_CONFIG", description: "Firebase configuration for email verification", required: false },
  ];

  const reploySteps: DeploymentStep[] = [
    {
      id: "clone",
      title: "Clone Repository",
      description: "Get the latest code from your repository",
      completed: false,
      command: "git clone https://github.com/your-username/nectiq-platform.git"
    },
    {
      id: "install",
      title: "Install Dependencies",
      description: "Install all required Node.js packages",
      completed: false,
      command: "npm install"
    },
    {
      id: "env",
      title: "Configure Environment",
      description: "Set up environment variables in Replit Secrets",
      completed: false,
    },
    {
      id: "database",
      title: "Setup Database",
      description: "Run database migrations and seed data",
      completed: false,
      command: "npm run db:push"
    },
    {
      id: "build",
      title: "Build Application",
      description: "Build the frontend for production",
      completed: false,
      command: "npm run build"
    },
    {
      id: "deploy",
      title: "Deploy to Replit",
      description: "Use Replit's built-in deployment feature",
      completed: false,
    }
  ];

  const vpsSteps: DeploymentStep[] = [
    {
      id: "server",
      title: "Prepare VPS Server",
      description: "Ubuntu 20.04+ with Node.js 18+, PostgreSQL, and Nginx",
      completed: false,
    },
    {
      id: "clone-vps",
      title: "Clone & Setup",
      description: "Clone repository and install dependencies",
      completed: false,
      command: "git clone https://github.com/your-username/nectiq-platform.git && cd nectiq-platform && npm install"
    },
    {
      id: "env-vps",
      title: "Environment Configuration",
      description: "Create .env file with production values",
      completed: false,
    },
    {
      id: "database-vps",
      title: "Database Setup",
      description: "Setup PostgreSQL and run migrations",
      completed: false,
      command: "npm run db:push"
    },
    {
      id: "pm2",
      title: "Process Manager",
      description: "Install and configure PM2 for process management",
      completed: false,
      command: "npm install -g pm2 && pm2 start ecosystem.config.js"
    },
    {
      id: "nginx",
      title: "Reverse Proxy",
      description: "Configure Nginx as reverse proxy with SSL",
      completed: false,
    }
  ];

  const renderStepList = (steps: DeploymentStep[]) => (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <Card key={step.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStep(step.id)}
                className="p-0 h-6 w-6"
              >
                {completedSteps.has(step.id) ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              <div className="flex-1">
                <CardTitle className="text-base">
                  {index + 1}. {step.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {step.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          {step.command && (
            <CardContent className="pt-0">
              <div className="bg-muted rounded-md p-3 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <code>{step.command}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(step.command!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Rocket className="h-8 w-8 text-blue-500" />
          Nectiq Platform Deployment
        </h1>
        <p className="text-muted-foreground">
          Deploy your cryptocurrency prediction platform to production environments
        </p>
      </div>

      <Tabs defaultValue="replit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="replit" className="flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Replit Deploy
          </TabsTrigger>
          <TabsTrigger value="vps" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            VPS/Server
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="replit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-500" />
                Deploy on Replit
              </CardTitle>
              <CardDescription>
                The easiest way to deploy your Nectiq platform with automatic scaling and built-in database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Rocket className="h-4 w-4" />
                <AlertDescription>
                  Replit offers one-click deployment with automatic HTTPS, custom domains, and built-in PostgreSQL database.
                </AlertDescription>
              </Alert>
              
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-green-500">$0</div>
                    <p className="text-sm text-muted-foreground">Development</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-blue-500">$20/mo</div>
                    <p className="text-sm text-muted-foreground">Production</p>
                  </CardContent>
                </Card>
              </div>

              {renderStepList(reploySteps)}
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-semibold mb-2">Replit Deployment Features:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Automatic HTTPS with custom domains</li>
                  <li>• Built-in PostgreSQL database</li>
                  <li>• Automatic scaling and load balancing</li>
                  <li>• Real-time logs and monitoring</li>
                  <li>• Zero-downtime deployments</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vps" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-orange-500" />
                VPS/Server Deployment
              </CardTitle>
              <CardDescription>
                Deploy on your own Virtual Private Server with full control and customization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-6">
                <Server className="h-4 w-4" />
                <AlertDescription>
                  Requires Ubuntu 20.04+ with at least 2GB RAM and 2 CPU cores for optimal performance.
                </AlertDescription>
              </Alert>

              {renderStepList(vpsSteps)}

              <div className="mt-6 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Automated Deployment Script</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use our automated deployment script for Ubuntu servers:
                    </p>
                    <div className="bg-muted rounded-md p-3 font-mono text-sm">
                      <div className="flex items-center justify-between">
                        <code>wget https://raw.githubusercontent.com/your-repo/nectiq-platform/main/deploy.sh && chmod +x deploy.sh && ./deploy.sh</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard("wget https://raw.githubusercontent.com/your-repo/nectiq-platform/main/deploy.sh && chmod +x deploy.sh && ./deploy.sh")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Minimum Requirements:</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 2GB RAM</li>
                        <li>• 2 CPU cores</li>
                        <li>• 20GB storage</li>
                        <li>• Ubuntu 20.04+</li>
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">Recommended:</h3>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• 4GB RAM</li>
                        <li>• 4 CPU cores</li>
                        <li>• 50GB SSD storage</li>
                        <li>• Ubuntu 22.04 LTS</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-500" />
                Environment Configuration
              </CardTitle>
              <CardDescription>
                Required environment variables and configuration settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {envVars.map((env) => (
                  <Card key={env.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                              {env.name}
                            </code>
                            <Badge variant={env.required ? "destructive" : "secondary"}>
                              {env.required ? "Required" : "Optional"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {env.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Alert className="mt-6">
                <Code className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Note:</strong> Never commit environment variables to your repository. 
                  Use Replit Secrets or server environment files (.env) for sensitive data.
                </AlertDescription>
              </Alert>

              <Card className="mt-6 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    Wallet Connection Troubleshooting
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <p><strong>If wallet detection fails after deployment:</strong></p>
                    <ol className="list-decimal list-inside space-y-2 pl-4">
                      <li>
                        <strong>WalletConnect Project ID:</strong> Make sure <code>VITE_WALLETCONNECT_PROJECT_ID</code> is set in Replit Secrets
                      </li>
                      <li>
                        <strong>Domain Authorization:</strong> Add your Replit domain (e.g., <code>your-repl.replit.app</code>) to your WalletConnect project's allowed domains at <a href="https://cloud.walletconnect.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">cloud.walletconnect.com</a>
                      </li>
                      <li>
                        <strong>HTTPS Required:</strong> Wallet connections only work on HTTPS - Replit automatically provides this
                      </li>
                      <li>
                        <strong>Clear Browser Cache:</strong> Clear cache and hard refresh (Ctrl+Shift+R) if wallet modal doesn't open
                      </li>
                      <li>
                        <strong>Check Console:</strong> Open browser dev tools and check for WalletConnect or projectId errors
                      </li>
                    </ol>
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                        💡 <strong>Quick Fix:</strong> If you see "projectId not set" errors, ensure your WalletConnect Project ID is correctly configured in production environment.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-base">Sample .env File</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto">
                    <pre>{`# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/nectiq"

# Session Management
SESSION_SECRET="your-super-secret-session-key"

# API Keys
COINGECKO_API_KEY="your-coingecko-api-key"
PYTH_RPC_URL="https://hermes.pyth.network"
ETHERSCAN_API_KEY="your-etherscan-api-key"

# Optional Firebase (for email verification)
FIREBASE_CONFIG='{
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id"
}'

# Production Settings
NODE_ENV="production"
PORT="5000"

# WalletConnect Configuration (CRITICAL for wallet connections)
VITE_WALLETCONNECT_PROJECT_ID="your-walletconnect-project-id"`}</pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => copyToClipboard(`# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/nectiq"

# Session Management
SESSION_SECRET="your-super-secret-session-key"

# API Keys
COINGECKO_API_KEY="your-coingecko-api-key"
PYTH_RPC_URL="https://hermes.pyth.network"
ETHERSCAN_API_KEY="your-etherscan-api-key"

# Optional Firebase (for email verification)
FIREBASE_CONFIG='{
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id"
}'

# Production Settings
NODE_ENV="production"
PORT="5000"`)}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Template
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Deploy Links</CardTitle>
          <CardDescription>One-click deployment to popular platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="https://replit.com/new/github/your-username/nectiq-platform" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <div className="font-semibold">Deploy to Replit</div>
                  <div className="text-sm text-muted-foreground">Instant deployment</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="https://vercel.com/new/clone?repository-url=https://github.com/your-username/nectiq-platform" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <div className="font-semibold">Deploy to Vercel</div>
                  <div className="text-sm text-muted-foreground">Frontend + API</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 justify-start" asChild>
              <a href="https://railway.app/template?template=https://github.com/your-username/nectiq-platform" target="_blank" rel="noopener noreferrer">
                <div className="text-left">
                  <div className="font-semibold">Deploy to Railway</div>
                  <div className="text-sm text-muted-foreground">Full-stack + DB</div>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}