<script setup lang="ts">
import { computed, ref } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useStand } from '@/stand/composables/useStand'

/**
 * Две галочки согласия и ошибка про условия. Состояние ошибки приходит
 * снаружи: его делят с кнопкой, которая может стоять в другом месте страницы.
 */
defineProps<{
  isErrorShown: boolean
}>()

const { t } = useStand()
const { acceptMarketing, acceptTerms } = useCheckout()

const text = computed(() => ({
  marketing: t('consent.marketing'),
  prefix: t('consent.prefix'),
  privacy: t('consent.privacy'),
  and: t('consent.and'),
  terms: t('consent.terms'),
  required: t('consent.required'),
}))

const termsRef = ref<HTMLElement>()

/** Подвести экран к галочке условий. */
function scrollToTerms() {
  termsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

defineExpose({ scrollToTerms })
</script>

<template>
  <div class="cc3-modal-footer-consent">
    <label class="cc3-modal-footer-consent__cell">
      <span class="cc3-modal-footer-consent__cell-text">
        {{ text.marketing }}
      </span>
      <input v-model="acceptMarketing" type="checkbox" class="cc3-modal-footer-consent__checkbox" />
    </label>

    <label ref="termsRef" class="cc3-modal-footer-consent__cell">
      <span class="cc3-modal-footer-consent__cell-text">
        {{ text.prefix }} <a href="#">{{ text.privacy }}</a> {{ text.and }}
        <a href="#">{{ text.terms }}</a>.
      </span>
      <input v-model="acceptTerms" type="checkbox" class="cc3-modal-footer-consent__checkbox" />
    </label>

    <p v-if="isErrorShown" class="cc3-modal-footer-consent__error" role="alert">
      {{ text.required }}
    </p>
  </div>
</template>

<style lang="scss">
.cc3-modal-footer-consent {
  display: flex;
  flex-direction: column;

  padding: 0 var(--st-global-distance-space-inset-2xl);

  &__cell {
    display: flex;
    align-items: center;
    gap: var(--st-global-distance-space-inset-xl);

    padding: var(--st-global-distance-space-inset-xl) 0;

    cursor: pointer;
  }

  &__cell-text {
    flex: 1;

    @include font('body-md');

    color: var(--st-content-foreground-color-neutral-primary);

    a {
      color: inherit;
    }
  }

  &__error {
    margin: 0;
    padding-block-end: var(--st-global-distance-space-inset-xl);

    @include font('body-sm');

    color: var(--st-content-foreground-color-negative-primary);
  }

  &__checkbox {
    @include cc3-modal-check-control;
  }
}
</style>
