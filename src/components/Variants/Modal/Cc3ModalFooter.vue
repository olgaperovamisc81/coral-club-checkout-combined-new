<script setup lang="ts">
import { ref } from 'vue'

import { useCheckout } from '@/composables/useCheckout'
import { useCheckoutSubmit } from '@/composables/useCheckoutSubmit'

import Cc3ModalFooterConsent from './Cc3ModalFooterConsent.vue'
import Cc3ModalFooterCta from './Cc3ModalFooterCta.vue'
import Cc3ModalFooterSite from './Cc3ModalFooterSite.vue'

/**
 * Подвал одной колонкой: галочки, кнопка, сайтовый подвал. Комбинированная
 * версия на широком экране собирает те же три части сама, в двух колонках.
 *
 * Комбинированная версия не гасит кнопку молча: без принятых условий она
 * остаётся активной, а нажатие объясняет причину под галочкой. Остальные
 * версии ведут себя как раньше.
 */
const props = defineProps<{
  explainBlocked?: boolean
}>()

const { isReady } = useCheckout()

const consentRef = ref<InstanceType<typeof Cc3ModalFooterConsent>>()

const { isTermsErrorShown, submit } = useCheckoutSubmit(Boolean(props.explainBlocked), () =>
  consentRef.value?.scrollToTerms(),
)
</script>

<template>
  <footer class="cc3-modal-footer">
    <Cc3ModalFooterConsent ref="consentRef" :is-error-shown="isTermsErrorShown" />

    <Cc3ModalFooterCta :is-disabled="!isReady && !explainBlocked" @submit="submit" />

    <Cc3ModalFooterSite />
  </footer>
</template>
