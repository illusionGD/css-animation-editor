<script setup lang="ts">
import { Button } from '@/components/ui/button'
</script>

<template>
  <div class="h-screen w-screen flex flex-col items-center justify-center space-y-4 bg-background text-foreground">
    <h1 class="text-3xl font-bold">CSS Animation Editor</h1>
    <div class="flex gap-4">
      <Button variant="default">Primary Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  </div>
</template>
