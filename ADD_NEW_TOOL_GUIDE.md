# How to Add a New Tool to the Menu

This guide shows you how to add a new OSINT tool to your platform's menu and create the corresponding page.

---

## 📋 Overview

Adding a new tool involves 4 steps:

1. **Add to Menu** - Update `DashboardLayout.tsx`
2. **Create Page** - Create a new component in `client/src/pages/`
3. **Add Route** - Register the route in `client/src/App.tsx`
4. **Deploy** - Push to GitHub

---

## Step 1: Add to Menu in DashboardLayout.tsx

### Open the file:
```
client/src/components/DashboardLayout.tsx
```

### Find the menu sections array (around line 36):
```typescript
const menuSections: MenuSection[] = [
  {
    section: "Core",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
      // ... more items
    ],
  },
  // ... more sections
];
```

### Choose a section or create a new one:

**Example: Add to existing "Network & Infrastructure" section**

Find this section:
```typescript
{
  section: "Network & Infrastructure",
  items: [
    { icon: Radar, label: "Network Scanner", path: "/network-scanner" },
    { icon: Network, label: "Nmap Scanner", path: "/nmap-scanner" },
    // ... more items
  ],
},
```

Add your new tool:
```typescript
{
  section: "Network & Infrastructure",
  items: [
    { icon: Radar, label: "Network Scanner", path: "/network-scanner" },
    { icon: Network, label: "Nmap Scanner", path: "/nmap-scanner" },
    { icon: Zap, label: "My New Tool", path: "/my-new-tool" },  // ← ADD THIS LINE
    // ... more items
  ],
},
```

### Available Icons:
The file imports icons from `lucide-react`. Here are common ones:

```typescript
// Network & Infrastructure
Radar, Network, Cpu, Globe, Power, Search

// Security & Forensics
Shield, Lock, AlertTriangle, Fingerprint, Eye

// Tools & Utilities
Code2, Mail, Link2, FileSearch, Zap, TrendingUp

// Devices
Smartphone, HardDrive, Car, Users

// General
LayoutDashboard, History, Bell, Archive, Map, Info
```

**Find more icons**: https://lucide.dev

### Example: Create a New Section

```typescript
{
  section: "My Custom Section",
  items: [
    { icon: Zap, label: "My New Tool", path: "/my-new-tool" },
    { icon: Search, label: "Another Tool", path: "/another-tool" },
  ],
},
```

---

## Step 2: Create the Page Component

### Create a new file:
```
client/src/pages/MyNewTool.tsx
```

### Basic template:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function MyNewTool() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Call your backend API or tRPC procedure here
      // const result = await trpc.myTool.analyze.useMutation();
      setResult({ success: true, data: "Your result here" });
    } catch (error) {
      setResult({ success: false, error: "Error occurred" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My New Tool</h1>
        <p className="text-gray-400">Description of what this tool does</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Tool Input</CardTitle>
          <CardDescription>Enter your data here</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button
            onClick={handleAnalyze}
            disabled={loading || !input}
            className="w-full"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <pre className="bg-gray-800 p-4 rounded text-green-400">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <p className="text-red-400">{result.error}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### More Advanced Example with tRPC:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export function MyNewTool() {
  const [input, setInput] = useState("");
  
  // Call your tRPC procedure
  const mutation = trpc.myTool.analyze.useMutation({
    onSuccess: (data) => {
      console.log("Success:", data);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  const handleAnalyze = () => {
    mutation.mutate({ input });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My New Tool</h1>
        <p className="text-gray-400">Analyze data with this tool</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter data..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button
            onClick={handleAnalyze}
            disabled={mutation.isPending || !input}
            className="w-full"
          >
            {mutation.isPending ? "Analyzing..." : "Analyze"}
          </Button>
        </CardContent>
      </Card>

      {mutation.data && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-800 p-4 rounded text-green-400">
              {JSON.stringify(mutation.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {mutation.error && (
        <Card className="bg-gray-900 border-gray-800 border-red-800">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-400">{mutation.error.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Step 3: Add Route in App.tsx

### Open the file:
```
client/src/App.tsx
```

### Find the routes section (look for `<Route>`):

```typescript
import { MyNewTool } from "./pages/MyNewTool";

export function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      // ... other routes
      <Route path="/my-new-tool" component={MyNewTool} />  // ← ADD THIS LINE
    </Router>
  );
}
```

### Make sure:
- The `path` matches what you put in `DashboardLayout.tsx` (e.g., `/my-new-tool`)
- The component is imported at the top of the file
- The component name matches your file name

---

## Step 4: Deploy to GitHub

### Test locally first:
```bash
# Start dev server
pnpm dev

# Visit http://localhost:3000
# Click your new tool in the menu
# Test that it works
```

### Commit and push:
```bash
# Stage changes
git add .

# Commit
git commit -m "feat: add My New Tool to menu"

# Push to GitHub
git push user_github main
```

Your site will auto-update in 2-5 minutes! ✅

---

## Complete Example: Adding "Email Validator" Tool

### 1. Update DashboardLayout.tsx:

Find "Visualization & Tools" section and add:
```typescript
{
  section: "Visualization & Tools",
  items: [
    // ... existing items
    { icon: Mail, label: "Email Validator", path: "/email-validator" },
  ],
},
```

### 2. Create `client/src/pages/EmailValidator.tsx`:

```typescript
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function EmailValidator() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = async () => {
    setLoading(true);
    try {
      // Simple email validation
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      setResult({
        email,
        isValid,
        message: isValid ? "Valid email address" : "Invalid email address",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email Validator</h1>
        <p className="text-gray-400">Check if an email address is valid</p>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Email Address</CardTitle>
          <CardDescription>Enter an email to validate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-gray-800 border-gray-700"
          />
          <Button
            onClick={validateEmail}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Validating..." : "Validate"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`bg-gray-900 border-gray-800 ${result.isValid ? 'border-green-800' : 'border-red-800'}`}>
          <CardHeader>
            <CardTitle className={result.isValid ? 'text-green-400' : 'text-red-400'}>
              {result.message}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300">Email: {result.email}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 3. Update `client/src/App.tsx`:

Add import:
```typescript
import { EmailValidator } from "./pages/EmailValidator";
```

Add route:
```typescript
<Route path="/email-validator" component={EmailValidator} />
```

### 4. Deploy:

```bash
git add .
git commit -m "feat: add Email Validator tool"
git push user_github main
```

---

## 🎨 UI Components You Can Use

The template includes pre-built components:

```typescript
// Inputs
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Display
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Dialogs
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Dropdowns
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
```

---

## 📚 Tips & Best Practices

### ✅ DO:
- Test locally before pushing
- Use meaningful icon names
- Add descriptions to your tool
- Handle loading and error states
- Use consistent styling with other tools

### ❌ DON'T:
- Hardcode API keys in components
- Forget to add the route in App.tsx
- Use paths that don't match between menu and route
- Add tools without testing

---

## 🆘 Troubleshooting

### Tool doesn't appear in menu?
1. Check spelling of `path` in DashboardLayout.tsx
2. Verify the section exists
3. Restart dev server: `pnpm dev`

### Route doesn't work?
1. Check `path` in App.tsx matches menu path
2. Verify component is imported
3. Check for TypeScript errors: `pnpm tsc`

### Styling looks wrong?
1. Use classes from existing tools as reference
2. Check Tailwind classes are correct
3. Use `bg-gray-900`, `border-gray-800`, `text-gray-400` for consistency

---

## Summary

```
1. Add to menu in DashboardLayout.tsx
   { icon: IconName, label: "Tool Name", path: "/tool-path" }

2. Create page component
   client/src/pages/ToolName.tsx

3. Add route in App.tsx
   <Route path="/tool-path" component={ToolName} />

4. Deploy
   git add . && git commit -m "feat: add tool" && git push user_github main
```

That's it! Your new tool is live! 🚀
