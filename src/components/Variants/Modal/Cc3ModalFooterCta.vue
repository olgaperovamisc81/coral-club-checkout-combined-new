<script setup lang="ts">
import { computed } from 'vue'

import { useStand } from '@/stand/composables/useStand'

/**
 * Кнопка «Перейти к оплате». Что происходит по нажатию, решает родитель.
 */
defineProps<{
  isDisabled: boolean
}>()

const emit = defineEmits<{
  submit: []
}>()

const { t } = useStand()

const text = computed(() => ({
  submit: t('submit.button'),
}))

function onClick() {
  emit('submit')
}
</script>

<template>
  <div class="cc3-modal-footer-cta">
    <button
      type="button"
      class="cc3-modal-footer-cta__button"
      :disabled="isDisabled"
      @click="onClick"
    >
      {{ text.submit }}
    </button>
  </div>
</template>

<style lang="scss">
.cc3-modal-footer-cta {
  padding: var(--st-global-distance-space-inset-md) var(--st-global-distance-space-inset-2xl)
    var(--st-global-distance-space-inset-2xl);

  &__button {
    padding: var(--st-global-distance-space-inset-xl);
    width: 100%;

    font-family: inherit;

    @include font('label-md');

    color: var(--st-action-foreground-color-onprimary-normal);
    background-color: var(--st-action-background-color-positive-normal);
    border: none;
    border-radius: var(--st-global-radius-pill);
    box-shadow:
      0 8px 16px 0 rgb(4 51 103 / 11%),
      0 2px 2px 0 rgb(0 80 178 / 6%);
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
