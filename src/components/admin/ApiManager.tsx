
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Send, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ApiManager = () => {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('');
  const [parameters, setParameters] = useState('{}');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const apiExamples = [
    {
      name: 'List All Users',
      method: 'GET',
      endpoint: '/api/admin/users',
      description: 'Retrieve all user accounts'
    },
    {
      name: 'Update User Role',
      method: 'PUT',
      endpoint: '/api/admin/users/role',
      description: 'Update user role to admin/user',
      body: '{"user_id": "uuid", "role": "admin"}'
    },
    {
      name: 'List Files',
      method: 'GET',
      endpoint: '/api/admin/files',
      description: 'Get all encrypted files'
    },
    {
      name: 'Delete File',
      method: 'DELETE',
      endpoint: '/api/admin/files/{id}',
      description: 'Delete a specific file'
    },
    {
      name: 'Get Activity Logs',
      method: 'GET',
      endpoint: '/api/admin/activities',
      description: 'Retrieve user activity logs'
    }
  ];

  const makeApiCall = async () => {
    if (!endpoint) {
      toast({
        title: 'Error',
        description: 'Please enter an endpoint',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    try {
      let parsedParams = {};
      if (parameters.trim()) {
        parsedParams = JSON.parse(parameters);
      }

      // Log the API call
      await supabase.from('api_logs').insert({
        admin_user_id: (await supabase.auth.getUser()).data.user?.id,
        endpoint,
        method,
        parameters: parsedParams,
        response_status: 200,
        response_data: { test: true }
      });

      // Simulate API response for demo
      const mockResponse = {
        status: 'success',
        data: parsedParams,
        endpoint,
        method,
        timestamp: new Date().toISOString()
      };

      setResponse(JSON.stringify(mockResponse, null, 2));

      toast({
        title: 'API Call Successful',
        description: 'Response received successfully'
      });
    } catch (error) {
      console.error('API call error:', error);
      const errorResponse = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      setResponse(JSON.stringify(errorResponse, null, 2));
      
      toast({
        title: 'API Call Failed',
        description: 'Failed to make API call',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard'
    });
  };

  const generateCurlCommand = () => {
    const baseUrl = window.location.origin;
    let curl = `curl -X ${method} "${baseUrl}${endpoint}"`;
    curl += ` -H "Authorization: Bearer YOUR_JWT_TOKEN"`;
    curl += ` -H "Content-Type: application/json"`;
    
    if (method !== 'GET' && parameters.trim()) {
      curl += ` -d '${parameters}'`;
    }
    
    return curl;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Manager
          </CardTitle>
          <CardDescription>
            Test and manage API endpoints for administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tester" className="space-y-4">
            <TabsList>
              <TabsTrigger value="tester">API Tester</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="docs">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="tester" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>HTTP Method</Label>
                    <Select value={method} onValueChange={setMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Endpoint</Label>
                    <Input
                      placeholder="/api/admin/users"
                      value={endpoint}
                      onChange={(e) => setEndpoint(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Parameters (JSON)</Label>
                    <Textarea
                      placeholder='{"key": "value"}'
                      value={parameters}
                      onChange={(e) => setParameters(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <Button onClick={makeApiCall} disabled={isLoading} className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Response</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(response)}
                        disabled={!response}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={response}
                      readOnly
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>cURL Command</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generateCurlCommand())}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={generateCurlCommand()}
                      readOnly
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {apiExamples.map((example, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{example.name}</CardTitle>
                        <Badge variant="outline">{example.method}</Badge>
                      </div>
                      <CardDescription className="text-xs">
                        {example.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-xs font-mono bg-muted p-2 rounded">
                          {example.endpoint}
                        </div>
                        {example.body && (
                          <div className="text-xs font-mono bg-muted p-2 rounded">
                            {example.body}
                          </div>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMethod(example.method);
                            setEndpoint(example.endpoint);
                            setParameters(example.body || '{}');
                          }}
                        >
                          Use Example
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="docs" className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h3>Authentication</h3>
                <p>All API endpoints require a valid JWT token from Supabase authentication:</p>
                <pre className="bg-muted p-3 rounded text-sm">
                  Authorization: Bearer YOUR_JWT_TOKEN
                </pre>

                <h3>Base URL</h3>
                <pre className="bg-muted p-3 rounded text-sm">
                  {window.location.origin}/api/admin
                </pre>

                <h3>Response Format</h3>
                <p>All responses follow this format:</p>
                <pre className="bg-muted p-3 rounded text-sm">
{`{
  "status": "success|error",
  "data": {},
  "message": "Optional message",
  "timestamp": "2023-12-01T12:00:00Z"
}`}
                </pre>

                <h3>Error Codes</h3>
                <ul>
                  <li><strong>401</strong> - Unauthorized (Invalid token)</li>
                  <li><strong>403</strong> - Forbidden (Not admin role)</li>
                  <li><strong>404</strong> - Not Found</li>
                  <li><strong>500</strong> - Internal Server Error</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManager;
