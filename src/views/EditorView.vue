<script setup lang="ts">
import TheHeader from '@/components/layout/TheHeader.vue'
import TheStage from '@/components/editor/TheStage.vue'
import PropertiesPanel from '@/components/editor/PropertiesPanel.vue'
import TheTimeline from '@/components/editor/TheTimeline.vue'
</script>

<template>
  <div class="h-screen w-screen flex flex-col overflow-hidden bg-background text-foreground">
    <!-- 1. Header -->
    <TheHeader />

    <!-- 2. Main Content (Stage + Properties) -->
    <div class="flex-1 flex overflow-hidden">
      
      <!-- Stage (Center) -->
      <main class="flex-1 relative min-w-0">
        <TheStage />
      </main>

      <!-- Properties Panel (Right) -->
      <aside>
        <PropertiesPanel />
      </aside>
      
    </div>

    <!-- 3. Timeline (Bottom) -->
    <footer class="h-64 shrink-0">
      <TheTimeline />
    </footer>
  </div>
</template>
