<template>
  <img alt="image" :src="imagePath" />
</template>

<script setup>
import {computed} from 'vue'

const props = defineProps({
  image: String,
  tempImage: String,
})

const getImagePath = () => {
  if (props.tempImage) return props.tempImage
  if (props.image) return `/images/${props.image}`
  return '/assets/profile.png'
}

const imagePath = computed(getImagePath)
</script>
