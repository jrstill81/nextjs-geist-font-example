"use client"

import SpecChecklist from '@/components/SpecChecklist'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header Image */}
      <div className="w-full h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        <img
          src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ee042a75-8517-46a8-a624-c4a64682edb3.png"
          alt="Modern minimalist checklist specification header with clean typography and layout"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/20">
                  <div class="text-center space-y-4">
                    <h1 class="text-4xl md:text-6xl font-bold text-foreground">Specification Checklist</h1>
                    <p class="text-lg text-muted-foreground">Build your project requirements with precision</p>
                  </div>
                </div>
              `;
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8">
        <SpecChecklist />
      </div>
    </main>
  )
}
