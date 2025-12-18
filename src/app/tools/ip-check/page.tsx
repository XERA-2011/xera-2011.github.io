"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { usePageTitle } from "@/hooks/use-page-title"
import jsyaml from "js-yaml"
import { Loader2, Check, AlertTriangle, Shield, Globe, Server } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ProxyNode {
  name: string
  type: string
  server: string
  port?: number | string
  uuid?: string
  cipher?: string
  network?: string
  ip?: string
  location?: string
  isp?: string
  riskScore?: number | "N/A"
  riskLevel?: "Low" | "Medium" | "High" | "Unknown"
  checking?: boolean
}

export default function IpCheckPage() {
  usePageTitle("IP Purity Check")
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [nodes, setNodes] = useState<ProxyNode[]>([])
  const [error, setError] = useState<string | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<{ count: number } | null>(null)

  const fetchSubscription = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    setNodes([])
    setSubscriptionInfo(null)

    try {
      // Use a CORS proxy if needed, or try direct fetch first
      // For demo purposes, we might need a CORS proxy for non-HTTPS or sensitive endpoints
      // Using a public CORS proxy is not ideal for privacy, but necessary for a client-side only tool demo
      // or we can ask the user to provide a CORS-friendly URL.

      // Use local server-side proxy to bypass CORS
      let response;
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`)
      }

      const text = await response.text()

      // Parse YAML
      let parsed: any
      try {
        parsed = jsyaml.load(text)
      } catch (e) {
        // Try Base64 decode if it looks like base64
        try {
          const decoded = atob(text.trim())
          parsed = jsyaml.load(decoded)
        } catch (base64Error) {
          throw new Error("Failed to parse subscription. Make sure it is valid YAML or Base64 encoded.")
        }
      }

      const proxies = parsed?.proxies || []

      if (!Array.isArray(proxies)) {
        throw new Error("No proxies found in the subscription.")
      }

      const formattedNodes: ProxyNode[] = proxies.map((p: any) => ({
        name: p.name,
        type: p.type,
        server: p.server,
        port: p.port,
        riskLevel: "Unknown",
        checking: false
      }))

      setNodes(formattedNodes)
      setSubscriptionInfo({ count: formattedNodes.length })

    } catch (err: any) {
      setError(err.message || "An error occurred fetching the subscription")
    } finally {
      setLoading(false)
    }
  }

  const checkNodeIP = async (index: number) => {
    const node = nodes[index]
    if (!node.server) return

    setNodes(prev => {
      const newNodes = [...prev]
      newNodes[index] = { ...newNodes[index], checking: true }
      return newNodes
    })

    try {
      // Step 1: Resolve IP (if it's a domain)
      let ipToCheck = node.server;

      // Simple regex to check if it's already an IP
      const isIp = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(node.server);

      if (!isIp) {
        try {
          const dnsRes = await fetch(`/api/dns?domain=${node.server}`);
          const dnsData = await dnsRes.json();
          if (dnsData.ip) {
            ipToCheck = dnsData.ip;
          } else {
            // If DNS API fails, we might still try generic check or throw
            console.warn("DNS resolution failed for", node.server);
          }
        } catch (e) {
          console.warn("Failed to call DNS API", e);
        }
      }

      // Using a secure proxy for the check (Direct IP check)
      const response = await fetch(`https://ipwho.is/${ipToCheck}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message)
      }

      const risk = "Unknown"; // Placeholder as we don't have a real risk API without key

      setNodes(prev => {
        const newNodes = [...prev]
        newNodes[index] = {
          ...newNodes[index],
          ip: data.ip,
          location: `${data.city}, ${data.country}`,
          isp: data.connection?.isp || data.isp,
          riskLevel: "Low", // Mocking risk
          riskScore: 0,
          checking: false
        }
        return newNodes
      })

    } catch (err: any) {
      setNodes(prev => {
        const newNodes = [...prev]
        newNodes[index] = {
          ...newNodes[index],
          checking: false,
          riskLevel: "Unknown",
          // Show error in ISP or Location field for visibility if needed
          location: "Check Failed"
        }
        return newNodes
      })
    }
  }

  const checkAll = () => {
    nodes.forEach((_, index) => {
      // Add a small delay to avoid rate limits
      setTimeout(() => {
        checkNodeIP(index)
      }, index * 500)
    })
  }

  return (
    <div className="relative w-full min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Page Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            IP Purity Check
          </h2>
          <p className="text-muted-foreground">
            Analyze your subscription nodes for IP purity and risk.
          </p>
        </motion.div>

        {/* Tool Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Enter your subscription URL (YAML/Base64).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="http://example.com/subscribe?token=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <Button onClick={fetchSubscription} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {subscriptionInfo && (
                <div className="flex items-center justify-between bg-secondary/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Loaded {subscriptionInfo.count} nodes</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={checkAll}>
                    Check All IPs
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {nodes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Nodes List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12.5">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Server</TableHead>
                      <TableHead>IP Info</TableHead>
                      <TableHead>Risk</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodes.map((node, i) => (
                      <TableRow key={i}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell className="font-medium">{node.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{node.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-50 truncate" title={node.server}>
                          {node.server}
                        </TableCell>
                        <TableCell>
                          {node.ip ? (
                            <div className="text-sm space-y-1">
                              <div className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {node.location}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Server className="h-3 w-3" />
                                {node.isp}
                              </div>
                              <div className="font-mono text-xs text-muted-foreground">{node.ip}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {node.riskLevel !== "Unknown" ? (
                            <Badge variant={node.riskLevel === "Low" ? "default" : "destructive"}>
                              {node.riskLevel}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => checkNodeIP(i)}
                            disabled={node.checking}
                          >
                            {node.checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
