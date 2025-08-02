"use client"

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface SpecItem {
  id: string
  name: string
  description: string
}

const specificationItems: SpecItem[] = [
  { id: 'responsive-design', name: 'Responsive Design', description: 'Mobile-first responsive layout across all devices' },
  { id: 'user-authentication', name: 'User Authentication', description: 'Login/logout functionality with secure sessions' },
  { id: 'database-integration', name: 'Database Integration', description: 'Full CRUD operations with data persistence' },
  { id: 'api-endpoints', name: 'REST API Endpoints', description: 'RESTful API with proper HTTP methods' },
  { id: 'search-functionality', name: 'Search Functionality', description: 'Advanced search with filters and sorting' },
  { id: 'file-upload', name: 'File Upload', description: 'Support for multiple file formats and validation' },
  { id: 'email-notifications', name: 'Email Notifications', description: 'Automated email alerts and confirmations' },
  { id: 'admin-dashboard', name: 'Admin Dashboard', description: 'Administrative interface with analytics' },
  { id: 'payment-integration', name: 'Payment Integration', description: 'Secure payment processing with multiple gateways' },
  { id: 'real-time-updates', name: 'Real-time Updates', description: 'Live data synchronization and notifications' },
  { id: 'data-export', name: 'Data Export', description: 'Export functionality in multiple formats (CSV, PDF, Excel)' },
  { id: 'multi-language', name: 'Multi-language Support', description: 'Internationalization with multiple language options' },
  { id: 'dark-mode', name: 'Dark Mode', description: 'Toggle between light and dark themes' },
  { id: 'seo-optimization', name: 'SEO Optimization', description: 'Search engine optimization with meta tags and structured data' },
  { id: 'performance-monitoring', name: 'Performance Monitoring', description: 'Analytics and performance tracking integration' }
]

export default function SpecChecklist() {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)
  const [customTitle, setCustomTitle] = useState('PROJECT SPECIFICATION SUMMARY')
  const [customSubtitle, setCustomSubtitle] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>('')
  const [customItems, setCustomItems] = useState<SpecItem[]>([])
  const [newItemName, setNewItemName] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [completedBy, setCompletedBy] = useState('')
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0])
  const [revision, setRevision] = useState('1.0')
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({})
  const resultsRef = useRef<HTMLDivElement>(null)

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
    setError('')
  }

  const handleSubmit = () => {
    if (selectedItems.size === 0) {
      setError('Please select at least one specification item before submitting.')
      return
    }
    setShowResults(true)
    setError('')
  }

  const handleClear = () => {
    setSelectedItems(new Set())
    setShowResults(false)
    setError('')
  }

  const handleReset = () => {
    setShowResults(false)
    setError('')
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        setLogoFile(file)
        const reader = new FileReader()
        reader.onload = (e) => {
          setLogoPreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setError('Please select a valid image file (PNG, JPG, etc.)')
      }
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview('')
  }

  const handleAddCustomItem = () => {
    if (newItemName.trim() && newItemDescription.trim()) {
      const newItem: SpecItem = {
        id: `custom-${Date.now()}`,
        name: newItemName.trim(),
        description: newItemDescription.trim()
      }
      setCustomItems([...customItems, newItem])
      setNewItemName('')
      setNewItemDescription('')
    } else {
      setError('Please enter both name and description for the custom item.')
    }
  }

  const handleRemoveCustomItem = (itemId: string) => {
    setCustomItems(customItems.filter(item => item.id !== itemId))
    // Also remove from selected items if it was selected
    const newSelected = new Set(selectedItems)
    newSelected.delete(itemId)
    setSelectedItems(newSelected)
  }

  const handleExportPDF = async () => {
    setIsExporting(true)
    setError('')
    
    try {
      // Create PDF using jsPDF text functionality
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const lineHeight = 7
      let yPosition = margin
      
      // Helper function to add text with word wrapping
      const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        pdf.setFontSize(fontSize)
        if (isBold) {
          pdf.setFont('helvetica', 'bold')
        } else {
          pdf.setFont('helvetica', 'normal')
        }
        
        const textLines = pdf.splitTextToSize(text, pageWidth - 2 * margin)
        
        // Check if we need a new page
        if (yPosition + (textLines.length * lineHeight) > pageHeight - margin) {
          pdf.addPage()
          yPosition = margin
        }
        
        pdf.text(textLines, margin, yPosition)
        yPosition += textLines.length * lineHeight + 3
      }
      
      // Add logo if provided
      if (logoPreview) {
        try {
          // Add logo to PDF
          const logoImg = new Image()
          logoImg.src = logoPreview
          await new Promise((resolve) => {
            logoImg.onload = resolve
          })
          
          // Calculate logo dimensions (max 40mm width, maintain aspect ratio)
          const maxLogoWidth = 40
          const logoAspectRatio = logoImg.width / logoImg.height
          const logoWidth = Math.min(maxLogoWidth, logoImg.width * 0.1)
          const logoHeight = logoWidth / logoAspectRatio
          
          // Center the logo
          const logoX = (pageWidth - logoWidth) / 2
          pdf.addImage(logoPreview, 'PNG', logoX, yPosition, logoWidth, logoHeight)
          yPosition += logoHeight + 10
        } catch (error) {
          console.warn('Could not add logo to PDF:', error)
        }
      }
      
      // Add custom title
      addText(customTitle, 20, true)
      yPosition += 5
      
      // Add custom subtitle if provided
      if (customSubtitle.trim()) {
        addText(customSubtitle, 14)
        yPosition += 5
      }
      
      // Add document metadata
      addText(`Completion Date: ${new Date(completionDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 10)
      addText(`Revision: ${revision}`, 10)
      if (completedBy.trim()) {
        addText(`Completed by: ${completedBy}`, 10)
      }
      addText(`Generated on: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}`, 10)
      yPosition += 10
      
      // Add included features section
      addText('✓ INCLUDED FEATURES', 16, true)
      yPosition += 5
      
      if (includedItems.length > 0) {
        includedItems.forEach((item, index) => {
          addText(`${index + 1}. ${item.name}`, 12, true)
          addText(`   ${item.description}`, 10)
          if (itemNotes[item.id]) {
            addText(`   Notes: ${itemNotes[item.id]}`, 10)
          }
          yPosition += 3
        })
      } else {
        addText('No features selected', 10)
      }
      
      yPosition += 10
      
      // Add excluded features section
      addText('✗ EXCLUDED FEATURES', 16, true)
      yPosition += 5
      
      if (excludedItems.length > 0) {
        excludedItems.forEach((item, index) => {
          addText(`${index + 1}. ${item.name}`, 12, true)
          addText(`   ${item.description}`, 10)
          if (itemNotes[item.id]) {
            addText(`   Notes: ${itemNotes[item.id]}`, 10)
          }
          yPosition += 3
        })
      } else {
        addText('All features selected', 10)
      }
      
      // Add summary
      yPosition += 15
      addText('SUMMARY', 16, true)
      yPosition += 5
      addText(`Total Features Available: ${specificationItems.length}`, 12)
      addText(`Features Included: ${includedItems.length}`, 12)
      addText(`Features Excluded: ${excludedItems.length}`, 12)
      addText(`Coverage: ${Math.round((includedItems.length / specificationItems.length) * 100)}%`, 12)
      
      // Generate filename with current date
      const fileDate = new Date().toISOString().split('T')[0]
      const filename = `specification-summary-${fileDate}.pdf`
      
      // Save the PDF
      pdf.save(filename)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const allItems = [...specificationItems, ...customItems]
  const includedItems = allItems.filter(item => selectedItems.has(item.id))
  const excludedItems = allItems.filter(item => !selectedItems.has(item.id))

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div ref={resultsRef} className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Specification Summary</h2>
            <p className="text-muted-foreground">Here's what is included and excluded in your specification</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Included Items */}
            <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Included Features ({includedItems.length})
                </CardTitle>
                <CardDescription>These features will be implemented</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {includedItems.length > 0 ? (
                  includedItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No features selected</p>
                )}
              </CardContent>
            </Card>

            {/* Excluded Items */}
            <Card className="border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Excluded Features ({excludedItems.length})
                </CardTitle>
                <CardDescription>These features will not be implemented</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {excludedItems.length > 0 ? (
                  excludedItems.map((item) => (
                    <div key={item.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border opacity-60">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">All features selected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* PDF Customization Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              PDF Customization Options
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomization(!showCustomization)}
              >
                {showCustomization ? 'Hide Options' : 'Show Options'}
              </Button>
            </CardTitle>
            <CardDescription>
              Customize your PDF export with a logo and custom text
            </CardDescription>
          </CardHeader>
          {showCustomization && (
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-title">Custom Title</Label>
                  <Input
                    id="custom-title"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Enter custom title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-subtitle">Custom Subtitle (Optional)</Label>
                  <Input
                    id="custom-subtitle"
                    value={customSubtitle}
                    onChange={(e) => setCustomSubtitle(e.target.value)}
                    placeholder="Enter custom subtitle"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="completed-by">Completed By</Label>
                  <Input
                    id="completed-by"
                    value={completedBy}
                    onChange={(e) => setCompletedBy(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completion-date">Completion Date</Label>
                  <Input
                    id="completion-date"
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revision">Revision</Label>
                  <Input
                    id="revision"
                    value={revision}
                    onChange={(e) => setRevision(e.target.value)}
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo Upload (Optional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="flex-1"
                  />
                  {logoPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                    >
                      Remove Logo
                    </Button>
                  )}
                </div>
                {logoPreview && (
                  <div className="mt-2">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-16 w-auto border rounded"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={handleReset} variant="outline">
            Modify Selection
          </Button>
          <Button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isExporting ? 'Generating PDF...' : 'Export as PDF'}
          </Button>
          <Button onClick={handleClear} variant="destructive">
            Start Over
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">Project Specification Checklist</h2>
        <p className="text-muted-foreground">Select the features and functionality you need for your project</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
          <CardDescription>
            Choose from the following specification items. Selected: {selectedItems.size} of {allItems.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {specificationItems.map((item) => (
              <div key={item.id} className="flex flex-col space-y-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={item.id}
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.name}
                    </label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <textarea
                  placeholder="Add additional notes (optional)"
                  className="w-full rounded border border-border p-2 text-sm resize-y"
                  value={itemNotes[item.id] || ''}
                  onChange={(e) => setItemNotes({ ...itemNotes, [item.id]: e.target.value })}
                />
              </div>
            ))}
            
            {/* Custom Items */}
            {customItems.map((item) => (
              <div key={item.id} className="flex flex-col space-y-2 p-4 rounded-lg border hover:bg-muted/50 transition-colors bg-blue-50/50 dark:bg-blue-950/20">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id={item.id}
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={() => handleItemToggle(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <label
                      htmlFor={item.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.name} <span className="text-blue-600 text-xs">(Custom)</span>
                    </label>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveCustomItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
                <textarea
                  placeholder="Add additional notes (optional)"
                  className="w-full rounded border border-border p-2 text-sm resize-y"
                  value={itemNotes[item.id] || ''}
                  onChange={(e) => setItemNotes({ ...itemNotes, [item.id]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Item Section */}
      <Card>
        <CardHeader>
          <CardTitle>Add Custom Item</CardTitle>
          <CardDescription>
            Add your own custom specification items to the checklist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-item-name">Item Name</Label>
              <Input
                id="new-item-name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter item name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-item-description">Item Description</Label>
              <Input
                id="new-item-description"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Enter item description"
              />
            </div>
          </div>
          <Button onClick={handleAddCustomItem} className="w-full">
            Add Custom Item
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-center gap-4">
        <Button onClick={handleClear} variant="outline">
          Clear All
        </Button>
        <Button onClick={handleSubmit} className="px-8">
          Generate Specification Summary
        </Button>
      </div>
    </div>
  )
}
